pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'auth-service/docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'devops-microservices'
    }
    
    stages {
        stage("build") {
            steps {
                echo "Building images"
                withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'PWD', usernameVariable: 'USER')]) {
                    sh 'docker build -t pariksh1th/devops:frontend frontend/'
                    sh 'docker build -t pariksh1th/devops:notes-service notes-service/'
                    sh 'docker build -t pariksh1th/devops:auth-service auth-service/'
                    sh "echo $PWD | docker login -u $USER --password-stdin"
                    sh 'docker push pariksh1th/devops:frontend'
                    sh 'docker push pariksh1th/devops:notes-service'
                    sh 'docker push pariksh1th/devops:auth-service'
                }
            }
        }
        
        stage("test") {
            steps {
                echo "Testing application"
                // Add your test commands here
            }
        }
        
        stage("deploy") {
            steps {
                echo "Deploying the application"
                withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'PWD', usernameVariable: 'USER')]) {
                    // Pull the latest images
                    sh "echo $PWD | docker login -u $USER --password-stdin"
                    
                    // Stop and remove existing containers
                    sh '''
                        if docker compose -f ${DOCKER_COMPOSE_FILE} ps &>/dev/null; then
                            docker compose -f ${DOCKER_COMPOSE_FILE} down
                        fi
                    '''
                    
                    // Pull latest images
                    sh 'docker compose -f ${DOCKER_COMPOSE_FILE} pull'
                    
                    // Deploy with docker-compose
                    sh '''
                        docker compose -f ${DOCKER_COMPOSE_FILE} up -d
                        docker compose -f ${DOCKER_COMPOSE_FILE} ps
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up docker images and containers
            sh '''
                docker system prune -f
                docker image prune -f
            '''
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            // Rollback logic could be added here
            sh '''
                if docker compose -f ${DOCKER_COMPOSE_FILE} ps &>/dev/null; then
                    docker compose -f ${DOCKER_COMPOSE_FILE} down
                fi
            '''
        }
    }
}
