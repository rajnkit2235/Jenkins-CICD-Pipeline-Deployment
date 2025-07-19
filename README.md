#DevOps CI/CD Pipeline (Jenkins + Docker + GitHub)

To ensure seamless and automated application delivery, this project incorporates a robust DevOps pipeline that leverages industry-standard tools like Jenkins, Docker, GitHub Webhooks, and EC2 infrastructure.




#🧩Architecture Overview

The entire lifecycle — from code commit to deployment — is automated through the following components:

#Source Code Management: GitHub (main branch)

#CI/CD Tool: Jenkins (running on an EC2 instance)

#Build System: Docker (Dockerfile-based custom builds)

#Deployment: Docker Compose (multi-container orchestration)

#Container Hosting: EC2 Ubuntu VM

#Image Registry: Docker Hub (rajankit6203/smartassist-ai-customer-support)

#Trigger Mechanism: GitHub webhook → Jenkins (via github-webhook plugin)



#🔁Complete Workflow

1. Code Push (GitHub)

-Developer pushes code changes to the main branch.

-GitHub sends a webhook to Jenkins to notify about the commit.

2. Webhook Trigger (Jenkins)

-Jenkins listens at http://<your-public-ec2-ip>:8080/github-webhook/.

-GitHub webhook is correctly configured and sends a push event.

-Jenkins validates the event and triggers the correct pipeline job.

3. Clone + Build Stage

-Jenkins pulls the latest code via SSH using a configured GitHub SSH key (SmartAssist-AI-ssh-Key).

-It builds a fresh Docker image using docker-compose build --no-cache to avoid stale builds.

4. Test Stage (Optional)

-Placeholder for future integration and unit tests.

5. Deploy Stage

-Jenkins brings down any existing container: docker-compose down

-Recreates the app container with updated image: docker-compose up -d --force-recreate

-Exposes app at: http://<ec2-public-ip>:8002




#✅DevOps Achievements in This Project

-Implemented end-to-end CI/CD with Jenkins Declarative Pipeline

-Dockerized the frontend app and deployed it via Docker Compose

-Configured secure GitHub SSH credentials in Jenkins

-Automated build triggers using GitHub Webhooks

-Used Docker Hub as a public image registry

-Hosted everything on AWS EC2 (self-managed Jenkins and Docker hosts)

-Enabled graceful rolling updates via --force-recreate




#📁File References

#Files	                 Description

Dockerfile	             Defines image and static file deployment

docker-compose.yaml 	 Manages container lifecycle and exposure

Jenkinsfile	             Describes CI/CD pipeline stages in Jenkins






🙋‍♂️ Author

Ankit Raj
GitHub: rajankit2295
