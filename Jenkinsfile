// === FE STAGING ===
def BRANCH         = "main"
def REPO_URL       = "https://github.com/abimsyaefulloh/fe-dumbmerch.git"
def SERVER         = "Abim22@103.196.152.65"          // AppServer (FE)
def CREDENTIALS_ID = "finaltask"                      // Jenkins Credentials ID (SSH)
def REMOTE_DIR     = "/home/Abim22/fe-dumbmerch"
def IMAGE_NAME     = "fe-dumbmerch-staging"
def CONTAINER_NAME = "fe-dumbmerch-staging"
def HOST_PORT      = "3002"                           // sesuai nginx staging
def APP_PORT       = "3000"                           // port di dalam container FE

pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Clone/Pull repo di server') {
      steps {
        sshagent([CREDENTIALS_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${SERVER} '
              set -e
              mkdir -p ${REMOTE_DIR}
              if git -C ${REMOTE_DIR} rev-parse --is-inside-work-tree >/dev/null 2>&1; then
                git -C ${REMOTE_DIR} fetch origin ${BRANCH}
                git -C ${REMOTE_DIR} checkout ${BRANCH}
                git -C ${REMOTE_DIR} reset --hard origin/${BRANCH}
              else
                rm -rf ${REMOTE_DIR}
                git clone -b ${BRANCH} ${REPO_URL} ${REMOTE_DIR}
              fi
            '
          """
        }
      }
    }

    stage('Build image FE') {
      steps {
        sshagent([CREDENTIALS_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${SERVER} '
              set -e
              cd ${REMOTE_DIR}
              docker build -t ${IMAGE_NAME} .
            '
          """
        }
      }
    }

    stage('Run/Restart container FE (staging)') {
      steps {
        sshagent([CREDENTIALS_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${SERVER} '
              set -e
              docker rm -f ${CONTAINER_NAME} || true
              docker run -d --name ${CONTAINER_NAME} \\
                --restart unless-stopped \\
                -p ${HOST_PORT}:${APP_PORT} \\
                ${IMAGE_NAME}
            '
          """
        }
      }
    }

    stage('Smoke test FE') {
      steps {
        sshagent([CREDENTIALS_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${SERVER} '
              curl -I --max-time 5 http://127.0.0.1:${HOST_PORT} || exit 1
            '
          """
        }
      }
    }
  }
}

