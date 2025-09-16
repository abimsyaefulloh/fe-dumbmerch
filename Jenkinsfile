// === FE STAGING ===
def BRANCH         = "main"
def REPO_URL       = "https://github.com/abimsyaefulloh/fe-dumbmerch.git"
def SERVER         = "Abim22@103.196.152.65"          // AppServer (FE)
def CREDENTIALS_ID = "finaltask"                      // Jenkins Credentials ID (SSH)
def REMOTE_DIR     = "/home/Abim22/fe-dumbmerch"      // pakai folder home, akses full
def IMAGE_NAME     = "fe-dumbmerch-staging"
def CONTAINER_NAME = "fe-dumbmerch-staging"
def HOST_PORT      = "3002"                           // sesuai nginx staging
def APP_PORT       = "3000"                           // port dalam container FE (ubah ke 5173 kalau Vite)

pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Clone/Pull repo di server') {
      steps {
        sshagent([CREDENTIALS_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${SERVER} '
              set -euo pipefail
              mkdir -p ${REMOTE_DIR}
              if git -C ${REMOTE_DIR} rev-parse --is-inside-work-tree >/dev/null 2>&1; then
                git -C ${REMOTE_DIR} fetch origin ${BRANCH}
                git -C ${REMOTE_DIR} checkout -f ${BRANCH}
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
              set -euo pipefail
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
              set -euo pipefail
              docker rm -f ${CONTAINER_NAME} || true
              docker run -d --name ${CONTAINER_NAME} \\
                --restart unless-stopped \\
                -e HOST=0.0.0.0 \\
                -e PORT=${APP_PORT} \\
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
              set -euo pipefail
              echo "Waiting for FE to be ready on port ${HOST_PORT} ..."
              for i in {1..30}; do
                if curl -sSf http://127.0.0.1:${HOST_PORT}/ >/dev/null; then
                  echo "FE is UP"; exit 0
                fi
                sleep 2
              done
              echo "FE did not respond in time. Last 200 lines of container logs:"
              docker logs ${CONTAINER_NAME} | tail -n 200
              exit 1
            '
          """
        }
      }
    }
  }
}
