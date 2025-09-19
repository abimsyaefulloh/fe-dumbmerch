// === FE PRODUCTION (tanpa clone di server, pakai HOME) ===
def branch     = "production"                       // ganti ke "main" kalau branch utamamu main
def server     = "Abim22@103.196.152.65"            // AppServer (FE)
def cred       = "finaltask"                        // Jenkins SSH Credentials ID

def directory  = "/home/Abim22/fe-dumbmerch-prod"   // folder KHUSUS prod (beda dari staging)
def image      = "fe-dumbmerch-prod"                // nama image prod
def container  = "fe-dumbmerch-prod"                // nama container prod
def host_port  = "3000"                             
def app_port   = "3000"                             // port di dalam container FE

pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout (SCM)') {
      steps { checkout scm }
    }

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

    stage('Build image FE (prod)') {
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

    stage('Run/Restart container FE (prod)') {
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
              curl -fsS -I http://127.0.0.1:${host_port} | head -n1
            '
          """
        }
      }
    }
  }
}
