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

Opcionalmente se puede crear un archivo common_tags.json con las etiquetas necesarias:

```json
{
  "Project": "Titvo Security Scan",
  "Customer": "Titvo",
  "Team": "Area Creacion"
}
```

1. Crear archivo .env con las variables necesarias descritas arriba
  ```bash
  export AWS_ACCESS_KEY_ID="tu_access_key"
  export AWS_SECRET_ACCESS_KEY="tu_secret_key"
  export AWS_DEFAULT_REGION="us-east-1"
  export AWS_STAGE="prod"
  export PROJECT_NAME="titvo-task-trigger" # Opcional si quiere mantener los valores por defecto. Esto se usará como prefijo para los recursos
  export PARAMETER_PATH="/titvo/security-scan" # Opcional si quiere mantener los valores por defecto. Esto se usará como prefijo para los parámetros
  export BUCKET_STATE_NAME="titvo-task-trigger-terraform-state" # Opcional, si no se especifica se usará el nombre del proyecto. Por ejemplo: titvo-security-scan-terraform-state
  ```
  > [!IMPORTANT]
  > `PARAMETER_PATH`deben tener los mismos valores que se usarion en el proyecto [titvo-security-scan-infra-aws](https://github.com/KaribuLab/titvo-security-scan-infra-aws)
1. Desplegar el proyecto
  ```bash
  npm install
  npm run build
  cd aws
  terragrunt run-all apply --auto-approve
  ```

## Licencia

Este proyecto está licenciado bajo [Apache License 2.0](LICENSE).