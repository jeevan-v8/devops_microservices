pipeline {
  agent any

  stages {
    stage("build") {
      steps {
        echo "Building images"
        withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'PWD', usernameVarialbe: "USER")]) {
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
      }
    }
    stage("deploy") {

      steps {
        echo "Deploying the application"
      }
    }
  }
}
