// Jenkins Declarative Pipeline
pipeline {
    // Jenkinsfile을 가져온 레포지토리 정보에 따라 워크스페이스를 설정합니다.
    agent any

    // 배포 환경에서 사용할 전역 환경 변수를 정의합니다.
    environment {
        // 도커 이미지 이름 (사용하시는 레포지토리 이름으로 대체)
        DOCKER_IMAGE_NAME = 'be4man-target-server' 
        // 도커 네트워크 이름 (사용하시는 네트워크 이름으로 대체)
        DOCKER_NETWORK = 'be4man-net' 
        // API 서버 주소 (요청하신 최종 웹훅 주소)
        WEBHOOK_URL = 'https://webhook.site/428c2cf5-8a7b-4b68-a1e4-5d7c038da79d'
        
        // 현재 운영 중인 서비스가 Blue인지 Green인지 판단하기 위한 초기 변수 (배포 과정에서 스위칭됨)
        CURRENT_CONTAINER = 'target-server-blue'
        NEXT_CONTAINER = 'target-server-green'
        CURRENT_PORT = 8082 // Nginx가 바라보는 현재 포트 (예시)
        NEXT_PORT = 8083    // 다음 배포 컨테이너 포트 (예시)
    }

    stages {
        stage('Docker Build') {
            steps {
                script {
                    // 현재 Nginx가 바라보는 컨테이너 이름 확인
                    def current = sh(returnStdout: true, script: "docker ps --format '{{.Names}}' | grep -w ${env.CURRENT_CONTAINER} || echo ''").trim()
                    
                    if (current == env.CURRENT_CONTAINER) {
                        env.NEXT_CONTAINER = 'target-server-green'
                    } else {
                        // 만약 Blue가 없다면 Green이 현재 서비스 중이므로, Blue를 다음 배포 대상으로 설정
                        env.CURRENT_CONTAINER = 'target-server-green'
                        env.NEXT_CONTAINER = 'target-server-blue'
                        env.CURRENT_PORT = 8083
                        env.NEXT_PORT = 8082
                    }
                    
                    echo "Building new image for: ${env.NEXT_CONTAINER}"
                    
                    // 빌드 대상 컨테이너 이름으로 이미지 태그 설정 (예: be4man-target-server:green)
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
                    sh "docker stop ${env.CURRENT_CONTAINER}"
                    sh "docker rm ${env.CURRENT_CONTAINER}"

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
                // 1. 전송할 빌드 정보 변수 정의 및 데이터 수집
                def SERVER_URL = env.WEBHOOK_URL

                def BUILD_STATUS = currentBuild.currentResult
                def BUILD_NUMBER = env.BUILD_NUMBER
                def BUILD_DURATION = currentBuild.durationString 
                
                // Job 이름, 레포지토리 URL 추가 (Jenkins 내장 환경 변수)
                def JOB_NAME = env.JOB_NAME
                // GIT_URL이 일반적이지만, 환경에 따라 GIT_ORIGIN_URL을 사용하기도 함.
                def REPOSITORY_URL = env.GIT_URL ?: env.GIT_ORIGIN_URL ?: "N/A"
                
                // SCM 변수 처리: Multibranch/PR 빌드 환경 변수 우선 사용
                def TARGET_BRANCH = env.BRANCH_NAME ?: "N/A" 
                def PR_ID = env.CHANGE_ID ?: "N/A" 

                // Source Branch 결정 (PR 빌드인 경우 CHANGE_BRANCH 사용)
                def SOURCE_BRANCH
                if (env.CHANGE_ID) {
                    SOURCE_BRANCH = env.CHANGE_BRANCH ?: "N/A"
                } else {
                    SOURCE_BRANCH = env.GIT_BRANCH ?: env.BRANCH_NAME ?: "N/A"
                }
                
                // 2. JSON Payload를 Groovy 변수로 정의합니다.
                // 모든 변수가 Groovy 영역에서 치환된 후, 셸(sh)에 단일 문자열로 전달됩니다.
                def payload = """
                    {
                        "status": "${BUILD_STATUS}", 
                        "buildNumber": "${BUILD_NUMBER}", 
                        "duration": "${BUILD_DURATION}", 
                        "sourceBranch": "${SOURCE_BRANCH}", 
                        "targetBranch": "${TARGET_BRANCH}", 
                        "prNumber": "${PR_ID}",
                        "jobName": "${JOB_NAME}",
                        "repositoryUrl": "${REPOSITORY_URL}"
                    }
                """

                // 3. curl 명령어를 사용하여 POST 요청 전송
                // --fail-with-body: 4xx, 5xx 에러 시 빌드 실패 처리 및 서버 응답 본문 출력
                sh """
                    echo "Sending deployment status to ${SERVER_URL}..."
                    
                    # Groovy 변수 payload와 SERVER_URL을 셸 스크립트에 전달
                    curl -X POST --fail-with-body -H "Content-Type: application/json" -d '$payload' "${SERVER_URL}"
                    
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