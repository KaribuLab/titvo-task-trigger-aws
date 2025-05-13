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

## Comandos Útiles

```shell
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Iniciar entorno local
npm run dev

# Desplegar en AWS
npm run deploy
```

## Licencia

Este proyecto está licenciado bajo [Apache License 2.0](LICENSE).