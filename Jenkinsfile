// === FE PRODUCTION (tanpa clone di server) ===
def branch     = "production"
def server     = "Abim22@103.196.152.65"
def cred       = "finaltask"

def directory  = "/opt/fe-dumbmerch-prod"      // beda folder dari staging
def image      = "fe-dumbmerch-prod"           // beda nama image
def container  = "fe-dumbmerch-prod"           // beda nama container
def host_port  = "3000"                         // host port PROD
def app_port   = "3000"                         // port di dalam container

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
