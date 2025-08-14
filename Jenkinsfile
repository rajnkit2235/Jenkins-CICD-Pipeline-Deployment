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
        
        stage('Load Image to KIND') {
            steps {
                echo '📦 Loading image directly to KIND cluster (bypassing Docker Hub)...'
                
                sh """
                    echo "Loading ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} to KIND cluster..."
                    
                    # Load the locally built image directly into KIND cluster
                    kind load docker-image ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} --name dev-cluster
                    
                    echo "✅ Image loaded to KIND cluster successfully!"
                    
                    # Verify image is loaded in cluster
                    docker exec dev-cluster-control-plane crictl images | grep smartassist || echo "Image loading in progress..."
                """
                
                echo '✅ Image loaded to cluster successfully!'
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '🚀 Deploying SmartAssist AI to Kubernetes...'
                
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh """
                        echo "📝 Updating deployment.yaml with local image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                        
                        # Create a copy of deployment.yaml and update it
                        cp k8s/deployment.yaml k8s/deployment-local.yaml
                        
                        # Replace IMAGE_PLACEHOLDER with actual image
                        sed -i 's|IMAGE_PLACEHOLDER|${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment-local.yaml
                        
                        # Add imagePullPolicy: Never to use local image (not from Docker Hub)
                        sed -i '/image: ${DOCKER_USERNAME}\\/${IMAGE_NAME}:${IMAGE_TAG}/a\\        imagePullPolicy: Never' k8s/deployment-local.yaml
                        
                        echo "=== Local Deployment Configuration ==="
                        cat k8s/deployment-local.yaml | grep -A 6 -B 2 image:
                        
                        echo "🚀 Applying deployment to namespace: ${K8S_NAMESPACE}..."
                        
                        # Apply deployment and service
                        kubectl --kubeconfig=\$KUBECONFIG apply -f k8s/deployment-local.yaml -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig=\$KUBECONFIG apply -f k8s/service.yaml -n ${K8S_NAMESPACE}
                        
                        echo "⏳ Waiting for deployment to complete..."
                        kubectl --kubeconfig=\$KUBECONFIG rollout status deployment/smartassist-ai-app -n ${K8S_NAMESPACE} --timeout=300s
                        
                        echo "🔗 Setting up external access for KIND cluster..."
                        pkill -f "kubectl port-forward.*smartassist-ai-service" || true
                        sleep 2
                        
                        # Start port forward in background for external access
                        nohup kubectl --kubeconfig=\$KUBECONFIG port-forward --address 0.0.0.0 service/smartassist-ai-service 8080:80 -n ${K8S_NAMESPACE} > /tmp/port-forward.log 2>&1 &
                        sleep 5
                        
                        echo "🌐 Port forward started - app should be accessible on port 8080"
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
                        kubectl --kubeconfig=\$KUBECONFIG get namespace ${K8S_NAMESPACE} || echo "Namespace not found"
                        
                        echo "=== PODS STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get pods -n ${K8S_NAMESPACE} -l app=smartassist-ai-app -o wide
                        
                        echo "=== SERVICES STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get svc -n ${K8S_NAMESPACE} -l app=smartassist-ai-app
                        
                        echo "=== DEPLOYMENT STATUS ==="
                        kubectl --kubeconfig=\$KUBECONFIG get deployment smartassist-ai-app -n ${K8S_NAMESPACE}
                        
                        echo "=== POD LOGS (last 10 lines) ==="
                        kubectl --kubeconfig=\$KUBECONFIG logs -l app=smartassist-ai-app -n ${K8S_NAMESPACE} --tail=10 || echo "No logs available yet"
                        
                        echo "=== ACCESS INFORMATION ==="
                        echo "🌐 External URL: http://13.221.231.200:8080"
                        echo "📱 Your SmartAssist AI should be accessible externally!"
                        echo "🔧 If not working, check port forward: ps aux | grep port-forward"
                        
                        echo "=== PORT FORWARD STATUS ==="
                        ps aux | grep -E "port-forward.*smartassist" | grep -v grep || echo "Port forward not found - may need manual setup"
                    """
                }
                
                echo '🎉 SmartAssist AI Customer Support verification complete!'
            }
        }
    }
    
    post {
        success {
            script {
                echo '🎉 SUCCESS! SmartAssist AI deployed to Kubernetes!'
                echo ''
                echo '📊 Deployment Summary:'
                echo "   ✅ Image: ${env.DOCKER_USERNAME}/${env.IMAGE_NAME}:${env.IMAGE_TAG} (local)"
                echo "   ✅ Namespace: ${env.K8S_NAMESPACE}"
                echo '   ✅ Cluster: KIND (Kubernetes in Docker)'
                echo '   ✅ Method: Direct image load (no Docker Hub needed)'
                echo ''
                echo '🌐 Access your SmartAssist AI:'
                echo '   • External URL: http://13.221.231.200:8080'
                echo '   • If not working, run: kubectl port-forward --address 0.0.0.0 service/smartassist-ai-service 8080:80 -n smart-frontened'
                echo ''
                echo '💡 Next: Set up Docker Hub Personal Access Token for full CI/CD'
            }
        }
        
        failure {
            script {
                echo '❌ FAILURE: SmartAssist AI deployment failed!'
                echo ''
                echo '🔧 Troubleshooting steps:'
                echo "   1. Check Docker images: docker images | grep smartassist"
                echo '   2. Check KIND cluster: docker ps | grep kind'
                echo '   3. Check kubectl access: kubectl get nodes'
                echo "   4. Check namespace: kubectl get namespace ${env.K8S_NAMESPACE}"
                echo "   5. Check pods: kubectl get pods -n ${env.K8S_NAMESPACE}"
            }
        }
        
        always {
            script {
                echo '🏁 Pipeline completed!'
                
                sh '''
                    echo "🧹 Final cleanup..."
                    docker system prune -f || true
                    
                    echo "💾 Disk space:"
                    df -h | grep -E '(Filesystem|/dev/)' | head -2
                '''
            }
        }
    }
}
