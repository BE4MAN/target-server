pipeline {
  agent any

  environment {
    IMAGE_NAME       = "be4man-target-server"
    CONTAINER_BLUE   = "target-server-blue"
    CONTAINER_GREEN  = "target-server-green"
    HOME             = "/tmp"
  }

  triggers { pollSCM('H/5 * * * *') }

  stages {
    stage('Git Checkout') {
      steps {
        echo "GitHub 코드 가져오는 중..."
        git branch: 'main', url: 'https://github.com/BE4MAN/target-server.git'
      }
    }

    stage('Docker Build') {
      steps {
        script {
          echo "Docker 이미지 빌드 중..."
          def blueRunning = sh(script: "docker ps --format '{{.Names}}' | grep ${CONTAINER_BLUE} || true", returnStdout: true).trim()
          if (blueRunning) {
            env.NEXT = "green"; env.NEXT_CONTAINER = CONTAINER_GREEN; env.PORT = "8083"
          } else {
            env.NEXT = "blue";  env.NEXT_CONTAINER = CONTAINER_BLUE;  env.PORT = "8082"
          }
          echo "다음 배포 대상: ${NEXT_CONTAINER} (${PORT})"
          sh "docker build -t ${IMAGE_NAME}:${NEXT} ."
        }
      }
    }

    stage('Deploy Container') {
      steps {
        script {
          echo "컨테이너 실행 중..."
          sh """
            docker stop ${NEXT_CONTAINER} || true
            docker rm   ${NEXT_CONTAINER} || true
            docker run -d --name ${NEXT_CONTAINER} \
              --network be4man-net \
              -p ${PORT}:8080 ${IMAGE_NAME}:${NEXT}
          """
        }
      }
    }

    stage('Switch Nginx (Blue ↔ Green)') {
      steps {
        script {
          echo "🔁 Nginx 트래픽 전환 준비 중..."
          
          sh """
            echo '새 컨테이너 DNS 반영 대기 중...'
            for i in {1..10}; do
              if docker exec nginx ping -c 1 ${NEXT_CONTAINER} > /dev/null 2>&1; then
                echo 'DNS 등록 확인됨'
                break
              fi
              echo '...아직 반영 안 됨, 1초 대기'
              sleep 1
            done
          """

          sh """
            echo 'Nginx 설정을 ${NEXT_CONTAINER}로 전환 중...'
            docker exec nginx sed -i "s/target-server-[a-z]\\+/target-server-${NEXT}/" /etc/nginx/conf.d/default.conf
            docker exec nginx nginx -s reload
          """
        }
      }
    }

    stage('Cleanup Old Containers') {
      steps {
        script {
          echo "이전 컨테이너 정리 중..."
          def oldContainer = (env.NEXT == 'blue') ? env.CONTAINER_GREEN : env.CONTAINER_BLUE
          sh """
            docker stop ${oldContainer} || true
            docker rm ${oldContainer} || true
          """
        }
      }
    }

    stage('Cleanup Old Images') {
      steps {
        echo "안쓰는 이미지 정리 중..."
        sh "docker image prune -f"
      }
    }
  }
}
