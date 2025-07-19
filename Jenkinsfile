pipeline {
    agent { label 'Smartassist-AI' }

    triggers {
        githubPush()
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'SmartAssist-AI-ssh-Key', url: 'git@github.com:rajnkit2235/SmartAssist---AI-Customer-Support.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker-compose build --no-cache'
            }
        }

        stage('Testing') {
            steps {
                echo 'This is the testing phase...'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d --force-recreate'
            }
        }
    }

    post {
        success {
            echo 'Build and Deployment saaaaaaccessfulll !!'
        }
        failure {
            echo 'Build failed.'
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}

