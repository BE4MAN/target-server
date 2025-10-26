// Jenkins Declarative Pipeline
pipeline {
    // 💡 1. 파라미터 정의: 외부 서버로부터 DEPLOYMENT_ID를 받습니다.
    // parameters {
    //    string(name: 'DEPLOYMENT_ID', defaultValue: '0', description: 'Deployment ID from external server (BIGINT).')
    //}

    // Jenkinsfile을 가져온 레포지토리 정보에 따라 워크스페이스를 설정합니다.
    agent any

    environment {
        // 웹훅 전송 타겟 URL을 새로운 주소로 변경했습니다.
        WEBHOOK_URL = 'https://webhook.site/428c2cf5-8a7b-4b68-a1e4-5d7c038da79d'

        // 도커 이미지 및 네트워크 변수 (이전 설정 유지)
        DOCKER_IMAGE_NAME = 'be4man-target-server'
        DOCKER_NETWORK = 'be4man-net'
        CURRENT_CONTAINER = 'target-server-blue'
        NEXT_CONTAINER = 'target-server-green'
        CURRENT_PORT = 8082
        NEXT_PORT = 8083
    }

    stages {
        stage('Docker Build') {
            steps {
                script {
                    // 현재 Nginx가 바라보는 컨테이너 이름 확인 및 Blue/Green 전환 결정
                    def current = sh(returnStdout: true, script: "docker ps --format '{{.Names}}' | grep -w ${env.CURRENT_CONTAINER} || echo ''").trim()

                    if (current == env.CURRENT_CONTAINER) {
                        env.NEXT_CONTAINER = 'target-server-green'
                    } else {
                        env.CURRENT_CONTAINER = 'target-server-green'
                        env.NEXT_CONTAINER = 'target-server-blue'
                        env.CURRENT_PORT = 8083
                        env.NEXT_PORT = 8082
                    }

                    echo "Building new image for: ${env.NEXT_CONTAINER}. Deployment ID: ${params.DEPLOYMENT_ID}"
                    sh "docker build -t ${env.DOCKER_IMAGE_NAME}:${env.NEXT_CONTAINER.split('-')[-1]} ."
                }
            }
        }

        stage('Deploy NEXT container') {
            steps {
                script {
                    echo "Deploying new container: ${env.NEXT_CONTAINER} on port ${env.NEXT_PORT}"

                    // 기존 NEXT 컨테이너가 있을 경우 중지 및 삭제 (무중단 보장을 위해)
                    sh "docker stop ${env.NEXT_CONTAINER} || true"
                    sh "docker rm ${env.NEXT_CONTAINER} || true"

                    // 새 컨테이너 실행
                    sh """
                        docker run -d --name ${env.NEXT_CONTAINER} \
                            --network ${env.DOCKER_NETWORK} \
                            -p ${env.NEXT_PORT}:8080 \
                            ${env.DOCKER_IMAGE_NAME}:${env.NEXT_CONTAINER.split('-')[-1]}
                    """
                }
            }
        }

        stage('Switch Nginx (Blue ↔ Green)') {
            // 새 컨테이너가 정상적으로 실행되는지 health check 로직 추가 권장 (생략)
            steps {
                script {
                    echo "Switching Nginx from ${env.CURRENT_CONTAINER} to ${env.NEXT_CONTAINER}"

                    // Nginx 설정 파일에서 현재 서비스 주소를 다음 서비스 주소로 교체
                    sh "docker exec nginx sed -i s/${env.CURRENT_CONTAINER}/${env.NEXT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                    // Nginx 설정 리로드
                    sh "docker exec nginx nginx -s reload"
                }
            }
        }

        stage('Cleanup Old Container & Images') {
            steps {
                script {
                    echo "Stopping and removing old container: ${env.CURRENT_CONTAINER}"

                    // 이전 서비스 컨테이너 중지 및 삭제
                    sh "docker stop ${env.CURRENT_CONTAINER} || true"
                    sh "docker rm ${env.CURRENT_CONTAINER} || true" //

                    // 사용되지 않는 Docker 이미지 정리
                    sh "docker image prune -f"
                }
            }
        }
    }

    // 빌드 결과와 관계없이 항상 실행되어야 하는 후처리 작업 (웹훅 전송)
    post {
        // 배포 성공/실패 여부와 관계없이 항상 실행
        always {
            script {
                // 빌드 시간 관련 변수 정의
                def endTimeMillis = System.currentTimeMillis()
                def startTimeMillis = currentBuild.startTimeInMillis

                // ISO 8601 포맷으로 변환 (UTC)
                def startTimeISO = new Date(startTimeMillis).format('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', TimeZone.getTimeZone('Asia/Seoul'))
                def endTimeISO = new Date(endTimeMillis).format('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', TimeZone.getTimeZone('Asia/Seoul'))

                // 3. JSON Payload 정의
                // TODO 나중에 서버에서 deploymentId 파라미터 받으면 아래 코드 추가
                // "deploymentId": "${params.DEPLOYMENT_ID}",

                def payload = """
                {
                    "jobName": "${env.JOB_NAME}",
                    "buildNumber": "${env.BUILD_NUMBER}",
                    "result": "${currentBuild.currentResult}",
                    "duration": "${currentBuild.durationString}",
                    "startTime": "${startTimeISO}",
                    "endTime": "${endTimeISO}"
                }
                """

                echo "Sending deployment status for Deployment ID: ${params.DEPLOYMENT_ID}"

                // 4. curl 명령어를 사용하여 POST 요청 전송
                sh """
                    echo "Sending deployment status to ${env.WEBHOOK_URL}..."

                    curl -X POST --fail-with-body -H "Content-Type: application/json" -d '$payload' "${env.WEBHOOK_URL}"

                    echo "Status sent successfully."
                """
            }
        }
        
        // Nginx 원복 로직 (파이프라인 단계 중 하나라도 실패 시에만 실행)
        failure {
            script {
                echo "실패 감지: Nginx 원복 시도. ${env.NEXT_CONTAINER} -> ${env.CURRENT_CONTAINER}"
                // Nginx를 다시 이전 (CURRENT) 컨테이너로 돌림
                sh "docker exec nginx sed -i s/${env.NEXT_CONTAINER}/${env.CURRENT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                sh "docker exec nginx nginx -s reload"
            }
        }
    }
}