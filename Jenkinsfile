pipeline {
    agent { 
        label 'jenkins-agent'
    }
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_USERNAME = 'rajankit6203'
        IMAGE_NAME = 'smartassist-ai-customer-support'
        K8S_NAMESPACE = 'smart-frontened'
        IMAGE_TAG = 'latest'
        // Remove KUBECONFIG from here - we'll use it inside stages
    }
    
    stages {
        stage('Clone') {
            steps {
                echo '📥 Cloning SmartAssist AI from GitHub...'
                git url: 'https://github.com/rajnkit2235/Jenkins-CICD-Pipeline-Deployment.git', 
                    branch: 'main'
                echo '✅ Successfully cloned repository!'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🏗️ Building SmartAssist AI Docker image...'
                
                sh """
                    echo "🧹 Cleaning old Docker cache and unused images..."
                    docker system prune -af --volumes || true
                    docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
                    
                    echo "🏗️ Building fresh image with --no-cache..."
                    docker build --no-cache -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} .
                    
                    echo "📊 Current Docker images:"
                    docker images | head -10
                """
                
                echo '✅ Docker image built successfully!'
            }
        }
        
        stage('Testing') {
            steps {
                echo '🧪 Testing SmartAssist AI image...'
                
                sh """
                    echo "Testing the built Docker image..."
                    docker run --rm ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} echo "✅ Image test successful!"
                """
                
                echo '✅ All tests completed successfully!'
            }
        }
        
        stage('Push Docker Image') {
            steps {
                echo '📤 Pushing SmartAssist AI to Docker Hub...'
                
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "🔐 Logging into Docker Hub securely..."
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        
                        echo "📤 Pushing ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}..."
                        docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                        
                        echo "✅ Image successfully pushed to Docker Hub!"
                        docker logout
                    """
                }
                
                echo '✅ Docker image pushed successfully!'
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '🚀 Deploying SmartAssist AI to Kubernetes...'
                
                // Use withCredentials for kubeconfig instead of environment
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh """
                        echo "📝 Updating deployment.yaml with image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                        
                        # Update deployment.yaml
                        sed -i 's|IMAGE_PLACEHOLDER|${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment.yaml
                        
                        echo "=== Deployment Configuration ==="
                        cat k8s/deployment.yaml | grep -A 3 -B 3 image:
                        
                        echo "🚀 Applying deployment to namespace: ${K8S_NAMESPACE}..."
                        
                        # Apply deployment and service
                        kubectl --kubeconfig=\$KUBECONFIG apply -f k8s/deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig=\$KUBECONFIG apply -f k8s/service.yaml -n ${K8S_NAMESPACE}
                        
                        echo "⏳ Waiting for deployment to complete..."
                        kubectl --kubeconfig=\$KUBECONFIG rollout status deployment/smartassist-ai-app -n ${K8S_NAMESPACE} --timeout=300s
                        
                        echo "🔗 Setting up external access for KIND cluster..."
                        pkill -f "kubectl port-forward.*smartassist-ai-service" || true
                        sleep 2
                        
                        # Start port forward in background
                        nohup kubectl --kubeconfig=\$KUBECONFIG port-forward --address 0.0.0.0 service/smartassist-ai-service 8080:80 -n ${K8S_NAMESPACE} > /tmp/port-forward.log 2>&1 &
                        sleep 5
                    """
                }
                
                echo '✅ Deployment to Kubernetes completed!'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '🔍 Verifying SmartAssist AI deployment...'
                
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh """
                        echo "=== NAMESPACE: ${K8S_NAMESPACE} ==="
                        kubectl --kubeconfig=\$KUBECONFIG get namespace ${K8S_NAMESPACE}
                        
                        echo "=== PODS STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get pods -n ${K8S_NAMESPACE} -l app=smartassist-ai-app -o wide
                        
                        echo "=== SERVICES STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get svc -n ${K8S_NAMESPACE} -l app=smartassist-ai-app
                        
                        echo "=== DEPLOYMENT STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get deployment smartassist-ai-app -n ${K8S_NAMESPACE}
                        
                        echo "=== ACCESS INFORMATION ==="
                        echo "🌐 External URL: http://13.221.231.200:8080"
                        echo "📱 Your SmartAssist AI is accessible externally!"
                        
                        echo "=== RECENT EVENTS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get events -n ${K8S_NAMESPACE} --sort-by='.lastTimestamp' | tail -5
                    """
                }
                
                echo '🎉 SmartAssist AI Customer Support is running successfully!'
            }
        }
    }
    
    post {
        success {
            script {
                echo '🎉 SUCCESS! SmartAssist AI deployed to Kubernetes!'
                echo ''
                echo '📊 Deployment Summary:'
                echo "   ✅ Image: ${env.DOCKER_USERNAME}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                echo "   ✅ Namespace: ${env.K8S_NAMESPACE}"
                echo '   ✅ Cluster: KIND (Kubernetes in Docker)'
                echo '   ✅ Zero downtime rolling update completed'
                echo ''
                echo '🌐 Access your SmartAssist AI:'
                echo '   • External URL: http://13.221.231.200:8080'
                echo '   • AI customer support fully functional'
            }
        }
        
        failure {
            script {
                echo '❌ FAILURE: SmartAssist AI deployment failed!'
                echo ''
                echo '🔧 Troubleshooting steps:'
                echo "   1. Check Docker build: docker images | grep smartassist"
                echo '   2. Check kubectl access: kubectl get nodes'
                echo "   3. Check pods: kubectl logs -l app=smartassist-ai-app -n smart-frontened"
                echo '   4. Check KIND cluster: docker ps | grep kind'
            }
        }
        
        always {
            script {
                echo '🏁 Pipeline completed!'
                
                sh '''
                    echo "🧹 Final cleanup - removing unused Docker resources..."
                    docker system prune -f || true
                    
                    echo "💾 Remaining disk space:"
                    df -h | grep -E '(Filesystem|/dev/)' | head -2
                    
                    echo "🔗 Port forward status:"
                    ps aux | grep -E "port-forward.*smartassist" | grep -v grep || echo "No active port forwards"
                '''
            }
        }
    }
}
