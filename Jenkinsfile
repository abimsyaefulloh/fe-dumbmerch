// === FE STAGING (tanpa clone di server) ===
def branch     = "staging"
def server     = "Abim22@103.196.152.65"       // AppServer (FE)
def cred       = "finaltask"                   // Jenkins SSH Credentials ID

def directory  = "/opt/fe-dumbmerch-staging"   // pisah dari prod
def image      = "fe-dumbmerch-staging"
def container  = "fe-dumbmerch-staging"
def host_port  = "3002"                        // host port STAGING
def app_port   = "3000"                        // port di dalam container (ubah ke 5173 jika Vite dev)

pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout (SCM)') { steps { checkout scm } }

    stage('Sync workspace → server') {
      steps {
        sshagent([cred]) {
          sh """
            set -e
            ssh -o StrictHostKeyChecking=no ${server} 'mkdir -p ${directory}'
            # kirim source dari Jenkins workspace (tanpa .git & node_modules)
            tar --exclude='.git' --exclude='node_modules' -C "${WORKSPACE}" -cf - . | \
              ssh -o StrictHostKeyChecking=no ${server} 'tar -C ${directory} -xf -'
          """
        }
      }
    }

    stage('Build image FE (staging)') {
      steps {
        sshagent([cred]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${server} '
              set -e
              cd ${directory}
              docker build -t ${image}:${branch} .
              docker tag  ${image}:${branch} ${image}:latest
            '
          """
        }
      }
    }

    stage('Run/Restart container FE (staging)') {
      steps {
        sshagent([cred]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${server} '
              set -e
              docker rm -f ${container} >/dev/null 2>&1 || true
              docker run -d --name ${container} \\
                -e HOST=0.0.0.0 \\
                -e PORT=${app_port} \\
                -p ${host_port}:${app_port} \\
                --restart unless-stopped \\
                ${image}:${branch}
            '
          """
        }
      }
    }

    stage('Smoke test') {
      steps {
        sshagent([cred]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${server} '
              set -e
              echo "Check http://127.0.0.1:${host_port}"
              for i in {1..30}; do
                if curl -fsS -I http://127.0.0.1:${host_port} | head -n1 | grep -q "200\\|301\\|302"; then
                  echo "FE STAGING is UP"
                  exit 0
                fi
                sleep 2
              done
              echo "FE STAGING did not respond in time. Last logs:"
              docker logs ${container} | tail -n 200
              exit 1
            '
          """
        }
      }
    }
  }
}
