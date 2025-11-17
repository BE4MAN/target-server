pipeline {
    parameters {
        string(name: 'DEPLOYMENT_ID', defaultValue: '2', description: 'Deployment ID from external server (BIGINT).')
    }

    agent any

    environment {
        DOCKER_IMAGE_NAME = 'be4man-target-server'
        DOCKER_NETWORK    = 'be4man-net'
        CURRENT_CONTAINER = 'target-server-blue'
        NEXT_CONTAINER    = 'target-server-green'
        CURRENT_PORT      = 8082
        NEXT_PORT         = 8083
    }

    stages {
        stage('Docker Build') {
            steps {
                script {
                    echo ">>> DEPLOYMENT_ID: ${params.DEPLOYMENT_ID}"

                    def current = sh(
                        returnStdout: true,
                        script: "docker ps --format '{{.Names}}' | grep -w ${env.CURRENT_CONTAINER} || echo ''"
                    ).trim()

                    if (current == env.CURRENT_CONTAINER) {
                        env.NEXT_CONTAINER = 'target-server-green'
                        env.CURRENT_CONTAINER = 'target-server-blue'
                        env.CURRENT_PORT = 8082
                        env.NEXT_PORT = 8083
                    } else {
                        env.NEXT_CONTAINER = 'target-server-blue'
                        env.CURRENT_CONTAINER = 'target-server-green'
                        env.CURRENT_PORT = 8083
                        env.NEXT_PORT = 8082
                    }

                    echo "Building image for NEXT: ${env.NEXT_CONTAINER} (DEPLOYMENT_ID=${params.DEPLOYMENT_ID})"
                    sh "docker build -t ${env.DOCKER_IMAGE_NAME}:${env.NEXT_CONTAINER.split('-')[-1]} ."
                }
            }
        }

        stage('Deploy NEXT container') {
            steps {
                script {
                    echo "Deploying ${env.NEXT_CONTAINER} on port ${env.NEXT_PORT}"
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
                    echo "Switch Nginx: ${env.CURRENT_CONTAINER} -> ${env.NEXT_CONTAINER}"
                    sh "docker exec nginx sed -i s/${env.CURRENT_CONTAINER}/${env.NEXT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                    sh "docker exec nginx nginx -s reload"
                }
            }
        }

        stage('Cleanup Old Container & Images') {
            steps {
                script {
                    echo "Cleanup old container: ${env.CURRENT_CONTAINER}"
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
                echo "=== Deployment Summary ==="
                echo "DEPLOYMENT_ID: ${params.DEPLOYMENT_ID}"
                echo "RESULT       : ${currentBuild.currentResult}"
                echo "DURATION     : ${currentBuild.durationString}"
            }
        }

        failure {
            script {
                echo "Failure detected. Reverting Nginx: ${env.NEXT_CONTAINER} -> ${env.CURRENT_CONTAINER}"
                sh "docker exec nginx sed -i s/${env.NEXT_CONTAINER}/${env.CURRENT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
                sh "docker exec nginx nginx -s reload"
            }
        }
    }
}
