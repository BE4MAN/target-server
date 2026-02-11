pipeline {
  parameters {
    string(name: 'DEPLOYMENT_ID', defaultValue: '2', description: 'Deployment ID (BIGINT).')
  }

  agent any

  environment {
    WEBHOOK_URL        = 'http://10.50.20.57:8081/webhooks/jenkins'
    WEBHOOK_START_URL  = 'http://10.50.20.57:8081/webhooks/jenkins/start'

    TARGET_DIR         = '/home/itsm/target-server'
    TARGET_SERVICE     = 'target-server'
    TARGET_PORT        = '8082'
  }

  stages {
    stage('Notify Start') {
      steps {
        script {
          def payload = """
          {
            "phase": "start",
            "deploymentId": "${params.DEPLOYMENT_ID}",
            "jobName": "${env.JOB_NAME}",
            "buildNumber": "${env.BUILD_NUMBER}"
          }
          """.trim()

          sh """
            curl -sS -X POST --fail-with-body \
              -H "Content-Type: application/json" \
              -d '${payload}' \
              "${env.WEBHOOK_URL}"
          """
        }
      }
    }

    stage('Checkout') {
      steps {
        git url: 'https://github.com/BE4MAN/target-server.git', branch: 'main'
      }
    }

    stage('Build (ALWAYS)') {
      steps {
        sh 'chmod +x gradlew || true'
        sh './gradlew clean bootJar'
      }
    }

    stage('Deploy (copy jar & restart)') {
      steps {
        sh '''
          set -euo pipefail

          # bootJar 결과만 선택 (plain.jar 방지)
          JAR_PATH=$(ls -1 build/libs/*.jar | grep -v -- '-plain\\.jar$' | head -n 1)
          if [ -z "$JAR_PATH" ]; then
            echo "No jar found in build/libs"
            ls -al build/libs || true
            exit 1
          fi
          echo "Using JAR: $JAR_PATH"

          sudo mkdir -p ${TARGET_DIR}
          sudo cp "$JAR_PATH" ${TARGET_DIR}/app.jar
          sudo systemctl restart ${TARGET_SERVICE}
        '''
      }
    }

    stage('Wait for TARGET_PORT (port only)') {
      steps {
        sh '''
          set -e
          for i in $(seq 1 30); do
            if ss -lnt | grep -q ':${TARGET_PORT} '; then
              echo "target-server is listening on ${TARGET_PORT}"
              exit 0
            fi
            echo "waiting target-server... ($i)"
            sleep 2
          done
          echo "target-server failed to start on ${TARGET_PORT}"
          sudo systemctl status ${TARGET_SERVICE} --no-pager || true
          sudo journalctl -u ${TARGET_SERVICE} -n 200 --no-pager || true
          exit 1
        '''
      }
    }
  }

  post {
    always {
      script {
        def endTimeMillis   = System.currentTimeMillis()
        def startTimeMillis = currentBuild.startTimeInMillis

        def startTimeISO = new Date(startTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", TimeZone.getTimeZone('UTC'))
        def endTimeISO   = new Date(endTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",   TimeZone.getTimeZone('UTC'))

        def payload = """
        {
          "phase": "end",
          "deploymentId": "${params.DEPLOYMENT_ID}",
          "jobName": "${env.JOB_NAME}",
          "buildNumber": "${env.BUILD_NUMBER}",
          "status": "${currentBuild.currentResult}",
          "duration": "${currentBuild.durationString}",
          "startTime": "${startTimeISO}",
          "endTime": "${endTimeISO}"
        }
        """.trim()

        sh """
          curl -sS -X POST --fail-with-body \
            -H "Content-Type: application/json" \
            -d '${payload}' \
            "${env.WEBHOOK_URL}"
        """
      }
    }
  }
}




// pipeline {
//     parameters {
//         string(name: 'DEPLOYMENT_ID', defaultValue: '2', description: 'Deployment ID from external server (BIGINT).')
//     }

//     agent any

//     environment {
//         WEBHOOK_URL      = 'https://be4man.store/webhooks/jenkins'
//         WEBHOOK_START_URL = 'https://be4man.store/webhooks/jenkins/start'
//         DOCKER_IMAGE_NAME = 'be4man-target-server'
//         DOCKER_NETWORK    = 'be4man-net'
//         CURRENT_CONTAINER = 'target-server-blue'
//         NEXT_CONTAINER    = 'target-server-green'
//         CURRENT_PORT      = 8082
//         NEXT_PORT         = 8083
//     }

//     stages {
//         stage('Notify Build Start') {
//             steps {
//                 script{
//                     def payload = """
//                     {
//                         "deploymentId": "${params.DEPLOYMENT_ID}",
//                         "jobName": "${env.JOB_NAME}",
//                         "buildNumber": "${env.BUILD_NUMBER}"
//                     }
//                     """

//                     sh """
//                         curl -X POST --fail-with-body -H "Content-Type: application/json" -d '${payload}' "${env.WEBHOOK_START_URL}"
//                     """
//                 }
//             }
//         }

//         stage('Docker Build') {
//             steps {
//                 script {
//                     echo ">>> DEPLOYMENT_ID: ${params.DEPLOYMENT_ID}"

//                     def current = sh(
//                         returnStdout: true,
//                         script: "docker ps --format '{{.Names}}' | grep -w ${env.CURRENT_CONTAINER} || echo ''"
//                     ).trim()

//                     if (current == env.CURRENT_CONTAINER) {
//                         env.NEXT_CONTAINER    = 'target-server-green'
//                         env.CURRENT_CONTAINER = 'target-server-blue'
//                         env.CURRENT_PORT = 8082
//                         env.NEXT_PORT    = 8083
//                     } else {
//                         env.NEXT_CONTAINER    = 'target-server-blue'
//                         env.CURRENT_CONTAINER = 'target-server-green'
//                         env.CURRENT_PORT = 8083
//                         env.NEXT_PORT    = 8082
//                     }

//                     echo "Building image for NEXT: ${env.NEXT_CONTAINER} (DEPLOYMENT_ID=${params.DEPLOYMENT_ID})"
//                     sh "docker build -t ${env.DOCKER_IMAGE_NAME}:${env.NEXT_CONTAINER.split('-')[-1]} ."
//                 }
//             }
//         }

//         stage('Deploy NEXT container') {
//             steps {
//                 script {
//                     echo "Deploying ${env.NEXT_CONTAINER} on port ${env.NEXT_PORT}"
//                     sh "docker stop ${env.NEXT_CONTAINER} || true"
//                     sh "docker rm ${env.NEXT_CONTAINER} || true"
//                     sh """
//                       docker run -d --name ${env.NEXT_CONTAINER} \
//                         --network ${env.DOCKER_NETWORK} \
//                         -p ${env.NEXT_PORT}:8080 \
//                         ${env.DOCKER_IMAGE_NAME}:${env.NEXT_CONTAINER.split('-')[-1]}
//                     """
//                 }
//             }
//         }

//         stage('Switch Nginx (Blue ↔ Green)') {
//             steps {
//                 script {
//                     echo "Switch Nginx: ${env.CURRENT_CONTAINER} -> ${env.NEXT_CONTAINER}"
//                     sh "docker exec nginx sed -i s/${env.CURRENT_CONTAINER}/${env.NEXT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
//                     sh "docker exec nginx nginx -s reload"
//                 }
//             }
//         }

//         stage('Cleanup Old Container & Images') {
//             steps {
//                 script {
//                     echo "Cleanup old container: ${env.CURRENT_CONTAINER}"
//                     sh "docker stop ${env.CURRENT_CONTAINER} || true"
//                     sh "docker rm ${env.CURRENT_CONTAINER} || true"
//                     sh "docker image prune -f"
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             script {
//                 def endTimeMillis   = System.currentTimeMillis()
//                 def startTimeMillis = currentBuild.startTimeInMillis

//                 def startTimeISO = new Date(startTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", TimeZone.getTimeZone('UTC'))
//                 def endTimeISO   = new Date(endTimeMillis).format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",   TimeZone.getTimeZone('UTC'))

//                 def payload = """
//                 {
//                   "deploymentId": "${params.DEPLOYMENT_ID}",
//                   "jobName": "${env.JOB_NAME}",
//                   "buildNumber": "${env.BUILD_NUMBER}",
//                   "status": "${currentBuild.currentResult}",
//                   "duration": "${currentBuild.durationString}",
//                   "startTime": "${startTimeISO}",
//                   "endTime": "${endTimeISO}"
//                 }
//                 """

//                 echo "Sending deployment status for Deployment ID: ${params.DEPLOYMENT_ID}"

//                 sh """
//                   echo "Sending deployment status to ${env.WEBHOOK_URL}..."
//                   curl -X POST --fail-with-body -H "Content-Type: application/json" -d '${payload}' "${env.WEBHOOK_URL}"
//                   echo "Status sent successfully."
//                 """
//             }
//         }

//         failure {
//             script {
//                 echo "실패 감지: Nginx 원복 시도. ${env.NEXT_CONTAINER} -> ${env.CURRENT_CONTAINER}"
//                 sh "docker exec nginx sed -i s/${env.NEXT_CONTAINER}/${env.CURRENT_CONTAINER}/g /etc/nginx/conf.d/default.conf"
//                 sh "docker exec nginx nginx -s reload"
//             }
//         }
//     }
// }
