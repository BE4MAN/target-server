pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    IMAGE_NAME      = "be4man-target-server"
    CONTAINER_BLUE  = "target-server-blue"
    CONTAINER_GREEN = "target-server-green"
    HOME            = "/tmp"
    DOCKER_NET      = "be4man-net"
  }

  stages {

    stage('Docker Build') {
      steps {
        script {
          def blueRunning = sh(
            script: "docker ps --format '{{.Names}}' | grep -w ${CONTAINER_BLUE} || true",
            returnStdout: true
          ).trim()

          if (blueRunning) {
            env.NEXT = "green"; env.NEXT_CONTAINER = CONTAINER_GREEN; env.NEXT_PORT = "8083"
            env.PREV = "blue";  env.PREV_CONTAINER = CONTAINER_BLUE;  env.PREV_PORT = "8082"
          } else {
            env.NEXT = "blue";  env.NEXT_CONTAINER = CONTAINER_BLUE;  env.NEXT_PORT = "8082"
            env.PREV = "green"; env.PREV_CONTAINER = CONTAINER_GREEN; env.PREV_PORT = "8083"
          }

          sh "docker build -t ${IMAGE_NAME}:${NEXT} ."
        }
      }
    }

    stage('Deploy NEXT container') {
      steps {
        script {
          sh """
            docker stop ${NEXT_CONTAINER} || true
            docker rm   ${NEXT_CONTAINER} || true

            docker run -d --name ${NEXT_CONTAINER} \\
              --network ${DOCKER_NET} \\
              -p ${NEXT_PORT}:8080 \\
              ${IMAGE_NAME}:${NEXT}
          """
        }
      }
    }

    stage('Switch Nginx (Blue ↔ Green)') {
      steps {
        script {
          sh """
            docker exec nginx sed -i 's/target-server-${PREV}/target-server-${NEXT}/g' /etc/nginx/conf.d/default.conf
            docker exec nginx nginx -s reload
          """
        }
      }
    }

    stage('Cleanup Old Container & Images') {
      steps {
        script {
          sh """
            docker stop ${PREV_CONTAINER} || true
            docker rm   ${PREV_CONTAINER} || true
          """
          sh "docker image prune -f"
        }
      }
    }
  }

  post {
    success {
      echo "Blue/Green 전환 성공: now serving ${NEXT_CONTAINER}"
    }
    failure {
      script {
        echo "실패 감지: Nginx 원복 시도"
        sh """
          docker exec nginx sed -i 's/target-server-${NEXT}/target-server-${PREV}/g' /etc/nginx/conf.d/default.conf || true
          docker exec nginx nginx -s reload || true
        """
      }
    }
  }
}
