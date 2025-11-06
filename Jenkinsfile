// Jenkins Declarative Pipeline
pipeline {
    parameters {
        string(name: 'DEPLOYMENT_ID', defaultValue: '2', description: 'Deployment ID from external server (BIGINT).')
    }

    agent any

    environment {
        WEBHOOK_URL      = 'https://webhook.site/f3aea49f-f9ec-4110-ab35-2f5d484aff34'
        DOCKER_IMAGE_NAME = 'be4man-target-server'
        DOCKER_NETWORK    = 'be4man-net'
        CURRENT_CONTAINER = 'target-server-blue'
        NEXT_CONTAINER    = 'target-server-green'
        CURRENT_PORT      = 8082
        NEXT_PORT         = 8083
    }

    stages {
        stage('[meta] Pre Hook Before Starting)') {
            steps {
                script {
                    // 파이프라인 시작 알림 (빌드 전)
                    def prePayload = """
                    {
                      "deploymentId": "${params.DEPLOYMENT_ID}",
                      "jobName": "${env.JOB_NAME}",
                      "buildNumber": "${env.BUILD_NUMBER}"
                    }
                    """

                    sh """
                      curl -sS -X POST -H "Content-Type: application/json" -d '$prePayload' '${env.WEBHOOK_URL}/pre' || true
                    """
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
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
                    sh "docker stop ${env.NEXT_CONTAINER} || true"
                    sh "docker rm ${env.NEXT_CONTAINER} || true"
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
            steps {
                script {
                    echo "Switching Nginx from ${env.CURRENT_CONTAINER} to ${env.NEXT_CONTAINER}"
                    sh "docker exec nginx sed -i s/${env.CURRENT_CONTAINER}/${env.NEXT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                    sh "docker exec nginx nginx -s reload"
                }
            }
        }

        stage('Cleanup Old Container & Images') {
            steps {
                script {
                    echo "Stopping and removing old container: ${env.CURRENT_CONTAINER}"
                    sh "docker stop ${env.CURRENT_CONTAINER} || true"
                    sh "docker rm ${env.CURRENT_CONTAINER} || true"
                    sh "docker image prune -f"
                }
            }
        }
    }

    post {
        always {
            script {
                // 종료 정보 계산
                def endTimeMillis   = System.currentTimeMillis()
                def startTimeMillis = currentBuild.startTimeInMillis
                def tz = TimeZone.getTimeZone('UTC')
                def startTimeISO = new Date(startTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", tz)
                def endTimeISO   = new Date(endTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", tz)

                def payload = """
                {
                  "deploymentId": "${params.DEPLOYMENT_ID}",
                  "result": "${currentBuild.currentResult}",
                  "duration": "${currentBuild.durationString}",
                  "startTime": "${startTimeISO}",
                  "endTime": "${endTimeISO}"
                }
                """

                echo "Sending final deployment status for Deployment ID: ${params.DEPLOYMENT_ID}"
                sh """
                  curl -sS -X POST --fail-with-body -H "Content-Type: application/json" -d '$payload' '${env.WEBHOOK_URL}/after'
                  echo "Status sent successfully."
                """
            }
        }

        failure {
            script {
                echo "실패 감지: Nginx 원복 시도. ${env.NEXT_CONTAINER} -> ${env.CURRENT_CONTAINER}"
                sh "docker exec nginx sed -i s/${env.NEXT_CONTAINER}/${env.CURRENT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                sh "docker exec nginx nginx -s reload"
            }
        }
    }
}
