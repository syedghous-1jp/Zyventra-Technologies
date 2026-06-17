const AWS = require('aws-sdk');

class CloudInventory {
  constructor(region = 'us-east-1') {
    this.s3 = new AWS.S3({ region });
    this.iam = new AWS.IAM({ region });
    this.ec2 = new AWS.EC2({ region });
  }

  async fetchAll() {
    const [s3, iam, ec2] = await Promise.all([
      this.getS3Buckets(),
      this.getIAMRoles(),
      this.getEC2Instances(),
    ]);
    return [...s3, ...iam, ...ec2];
  }

  async getS3Buckets() {
    const res = await this.s3.listBuckets().promise();
    return res.Buckets.map(b => ({
      id: `aws_s3_bucket.${b.Name}`,
      type: 'aws_s3_bucket',
      name: b.Name,
      cloudId: b.Name,
      source: 'aws',
    }));
  }

  async getIAMRoles() {
    const res = await this.iam.listRoles().promise();
    return res.Roles.map(r => ({
      id: `aws_iam_role.${r.RoleName}`,
      type: 'aws_iam_role',
      name: r.RoleName,
      cloudId: r.Arn,
      source: 'aws',
    }));
  }

  async getEC2Instances() {
    const res = await this.ec2.describeInstances().promise();
    const instances = [];
    for (const r of res.Reservations) {
      for (const i of r.Instances) {
        instances.push({
          id: `aws_instance.${i.InstanceId}`,
          type: 'aws_instance',
          name: i.InstanceId,
          cloudId: i.InstanceId,
          source: 'aws',
        });
      }
    }
    return instances;
  }
}

module.exports = { CloudInventory };
