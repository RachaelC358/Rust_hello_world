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

// Export the repository URL for easy access
export const repositoryUrl = ecrRepository.repositoryUrl;
export const repositoryName = ecrRepository.name;
