import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an ECR repository for our Rust application
const ecrRepository = new aws.ecr.Repository("rust-hello-world", {
    name: "rust-hello-world",
    imageTagMutability: "MUTABLE",
    imageScanningConfiguration: {
        scanOnPush: true,
    },
});

// Get default VPC and subnets (free tier friendly)
const defaultVpc = aws.ec2.getVpc({ default: true });
const defaultSubnets = aws.ec2.getSubnets({
    filters: [{ 
        name: "default-for-az", 
        values: ["true"] 
    }]
});

// Security group for the ECS service
const webSecurityGroup = new aws.ec2.SecurityGroup("web-secgrp", {
    description: "Security group for Rust web server",
    vpcId: defaultVpc.then(vpc => vpc.id),
    ingress: [
        {
            protocol: "tcp",
            fromPort: 8080,
            toPort: 8080,
            cidrBlocks: ["0.0.0.0/0"], // Allow HTTP access from anywhere
        },
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"], // Allow all outbound traffic
        },
    ],
});

// ECS Cluster
const cluster = new aws.ecs.Cluster("rust-hello-world-cluster", {
    name: "rust-hello-world-cluster",
});

// IAM role for ECS task execution
const taskExecutionRole = new aws.iam.Role("task-execution-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: { Service: "ecs-tasks.amazonaws.com" },
        }],
    }),
});

const taskExecutionRolePolicyAttachment = new aws.iam.RolePolicyAttachment("task-execution-role-policy", {
    role: taskExecutionRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

// ECS Task Definition
const taskDefinition = new aws.ecs.TaskDefinition("rust-hello-world-task", {
    family: "rust-hello-world-task",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: "256", // 0.25 vCPU - free tier eligible
    memory: "512", // 0.5 GB RAM - free tier eligible
    executionRoleArn: taskExecutionRole.arn,
    containerDefinitions: pulumi.jsonStringify([{
        name: "rust-hello-world",
        image: pulumi.interpolate`${ecrRepository.repositoryUrl}:latest`,
        portMappings: [{
            containerPort: 8080,
            protocol: "tcp",
        }],
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-group": "/ecs/rust-hello-world",
                "awslogs-region": "us-east-1",
                "awslogs-stream-prefix": "ecs",
            },
        },
    }]),
});

// CloudWatch Log Group
const logGroup = new aws.cloudwatch.LogGroup("rust-hello-world-logs", {
    name: "/ecs/rust-hello-world",
    retentionInDays: 7, // Keep logs for 7 days only to save costs
});

// ECS Service
const service = new aws.ecs.Service("rust-hello-world-service", {
    cluster: cluster.arn,
    taskDefinition: taskDefinition.arn,
    launchType: "FARGATE",
    desiredCount: 1, // Run only 1 instance for demo
    networkConfiguration: {
        subnets: defaultSubnets.then(subnets => subnets.ids),
        securityGroups: [webSecurityGroup.id],
        assignPublicIp: true, // Needed for Fargate in public subnet
    },
});

// Export useful values
export const repositoryUrl = ecrRepository.repositoryUrl;
export const repositoryName = ecrRepository.name;
export const clusterName = cluster.name;
export const serviceName = service.name;
export const securityGroupId = webSecurityGroup.id;
