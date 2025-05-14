# Titvo Task Trigger

Servicio para la gestión de tareas de escaneo de seguridad en repositorios de diferentes fuentes SCM (Source Control Management).

## Descripción

Este proyecto implementa un servicio que permite iniciar y gestionar tareas de escaneo de seguridad sobre repositorios de código. Soporta múltiples fuentes como:

- GitHub
- BitBucket
- GitLab
- CLI (línea de comandos)

El servicio está diseñado para funcionar como una Lambda en AWS, expuesta a través de API Gateway.

## Características

- Validación de API Keys para autenticación
- Estrategias específicas para diferentes fuentes SCM
- Encriptación de tokens y datos sensibles
- Gestión de trabajos a través de AWS Batch
- Seguimiento del estado de los escaneos
- Manejo consistente de errores

## Requisitos

- [NVM](https://github.com/nvm-sh/nvm)
- [Task](https://taskfile.dev/installation/)
- [Terraform](https://developer.hashicorp.com/terraform/install?product_intent=terraform)
- [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/)

> [!IMPORTANT]
> En windows se **DEBE** usar [Windows Subsystem for Linux 2 (WSL2)](https://learn.microsoft.com/es-es/windows/wsl/install)

## Estructura del Proyecto

```shell
.
├── aws                  # Recursos de AWS
│   ├── cloudwatch       # Configuración de CloudWatch
│   ├── lambda           # Configuración de Lambda
│   └── parameter        # Parámetros de AWS
├── auth                 # Módulo de autenticación
├── shared               # Código compartido
├── src                  # Código fuente principal
│   ├── api-key          # Gestión de API Keys
│   ├── common           # Utilidades comunes
│   ├── crypto           # Servicios de criptografía
│   ├── scm              # Estrategias para diferentes SCM
│   └── task-trigger     # Lógica de disparadores de tareas
├── test                 # Tests unitarios e integración
├── trigger              # Implementación del core de la aplicación
├── localstack           # Configuración para desarrollo local
└── .vscode              # Configuración de VS Code
```

## Desarrollo Local

Para el desarrollo local, se utiliza LocalStack. La configuración se encuentra en el archivo `localstack.hcl`.

## Despliegue

Modifica los valores del archivo `serverless.hcl` con los valores de tu proyecto.

```hcl
locals {
  region = get_env("AWS_REGION")
  stage  = get_env("AWS_STAGE")
  stages = {
    test = {
      name = "Testing"
    },
    localstack = {
      name = "Localstack"
    },
    prod = {
      name = "Production"
    }
  }
  service_name   = "my-service"
  service_bucket = "${local.service_name}-${local.region}"
  log_retention  = 7
  parameter_path = "/my-service"
  common_tags = {
    my_tag = "my-tag-value"
  }
}
```

1. Clone el repositorio en la máquina local.

  ```shell
  git clone https://github.com/KaribuLab/titvo-task-trigger.git
  cd titvo-task-trigger
  git submodule init
  git submodule update
  ```

2. Primero necesitará cargar las variables ambiente con las credenciales de AWS.

  ```shell
  export AWS_ACCESS_KEY_ID="..."
  export AWS_SECRET_ACCESS_KEY="..."
  export AWS_SESSION_TOKEN="..."
  export AWS_REGION="..."
  export AWS_STAGE="..."
  ```

  O creando un archivo `.env` en la raíz del proyecto con las variables de entorno.

  ```shell
  export AWS_ACCESS_KEY_ID="..."
  export AWS_SECRET_ACCESS_KEY="..."
  export AWS_SESSION_TOKEN="..."
  export AWS_REGION="..."
  export AWS_STAGE="..."
  ```

  > [!NOTE]
  > Para cargar las variables de entorno, se puede usar el siguiente comando: `source .env`.

3. Luego, se puede proceder a instalar las dependencias y ejecutar el despliegue.

  ```shell
  npm install
  npm run build
  cd aws
  terragrunt run-all apply
  ```

## Licencia

Este proyecto está licenciado bajo [Apache License 2.0](LICENSE).