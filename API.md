# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### IamCredentialsRotator <a name="IamCredentialsRotator" id="cdk-iam-credentials-rotator.IamCredentialsRotator"></a>

#### Initializers <a name="Initializers" id="cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer"></a>

```typescript
import { IamCredentialsRotator } from 'cdk-iam-credentials-rotator'

new IamCredentialsRotator(scope: Construct, id: string, props: IIamCredentialsRotatorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps">IIamCredentialsRotatorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-iam-credentials-rotator.IamCredentialsRotator.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps">IIamCredentialsRotatorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-iam-credentials-rotator.IamCredentialsRotator.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-iam-credentials-rotator.IamCredentialsRotator.isConstruct"></a>

```typescript
import { IamCredentialsRotator } from 'cdk-iam-credentials-rotator'

IamCredentialsRotator.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-iam-credentials-rotator.IamCredentialsRotator.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IamCredentialsRotator.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-iam-credentials-rotator.IamCredentialsRotator.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IIamCredentialsRotatorProps <a name="IIamCredentialsRotatorProps" id="cdk-iam-credentials-rotator.IIamCredentialsRotatorProps"></a>

- *Implemented By:* <a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps">IIamCredentialsRotatorProps</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.credentialsHandler">credentialsHandler</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function which is invoked after new credentials are created for a user. |
| <code><a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.users">users</a></code> | <code><a href="#cdk-iam-credentials-rotator.IUser">IUser</a>[]</code> | List of users to rotate credentials for in the target account. |
| <code><a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.cleanupWaitDuration">cleanupWaitDuration</a></code> | <code>aws-cdk-lib.Duration</code> | The amount of time to wait before deleting old credentials. |
| <code><a href="#cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.scheduleDuration">scheduleDuration</a></code> | <code>aws-cdk-lib.Duration</code> | Frequency of key rotation. |

---

##### `credentialsHandler`<sup>Required</sup> <a name="credentialsHandler" id="cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.credentialsHandler"></a>

```typescript
public readonly credentialsHandler: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function which is invoked after new credentials are created for a user.

---

##### `users`<sup>Required</sup> <a name="users" id="cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.users"></a>

```typescript
public readonly users: IUser[];
```

- *Type:* <a href="#cdk-iam-credentials-rotator.IUser">IUser</a>[]

List of users to rotate credentials for in the target account.

---

##### `cleanupWaitDuration`<sup>Optional</sup> <a name="cleanupWaitDuration" id="cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.cleanupWaitDuration"></a>

```typescript
public readonly cleanupWaitDuration: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 5 minutes

The amount of time to wait before deleting old credentials.

This value MUST be significantly less-than `scheduleDuration`.

---

##### `scheduleDuration`<sup>Optional</sup> <a name="scheduleDuration" id="cdk-iam-credentials-rotator.IIamCredentialsRotatorProps.property.scheduleDuration"></a>

```typescript
public readonly scheduleDuration: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 1 hour

Frequency of key rotation.

---

### IUser <a name="IUser" id="cdk-iam-credentials-rotator.IUser"></a>

- *Implemented By:* <a href="#cdk-iam-credentials-rotator.IUser">IUser</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iam-credentials-rotator.IUser.property.username">username</a></code> | <code>string</code> | Username of an IAM user in the target account. |
| <code><a href="#cdk-iam-credentials-rotator.IUser.property.metadata">metadata</a></code> | <code>string</code> | Optional metadata. |

---

##### `username`<sup>Required</sup> <a name="username" id="cdk-iam-credentials-rotator.IUser.property.username"></a>

```typescript
public readonly username: string;
```

- *Type:* string

Username of an IAM user in the target account.

---

##### `metadata`<sup>Optional</sup> <a name="metadata" id="cdk-iam-credentials-rotator.IUser.property.metadata"></a>

```typescript
public readonly metadata: string;
```

- *Type:* string

Optional metadata.

---

