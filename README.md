# Restaurant POS App

Una aplicación de punto de venta (POS) para restaurantes, desarrollada con React Native y Expo. Esta app ofrece una solución para la gestión de un restaurante, permitiendo la interacción entre diferentes perfiles de usuario: **Clientes**, **Chefs**, **Meseros**, **Cajeros** y **Administradores**.

## Descripción

La **Restaurant POS App** está diseñada para optimizar la operación de un restaurante, facilitando:

- **Clientes:**  
  - Visualización del menú.
  - Escaneo del código QR de la mesa.
  - Agregar productos al carrito y realizar pedidos.

- **Chefs:**  
  - Visualización y actualización del estado de las órdenes en tiempo real.
  
- **Meseros:**  
  - Gestión de la entrega de pedidos y actualización de su estado.

- **Cajeros:**  
  - Procesamiento de pagos y generación de recibos.

- **Administradores:**  
  - Gestión de usuarios y menú, con dashboards que permiten operaciones CRUD (crear, leer, actualizar y eliminar).
  - Visualización de todos los flujos (Chef, Mesero, Cajero)
  - Visualiación de Ordenes previos y recibos de todas las ordenes.

La aplicación se conecta a Firebase para el manejo en tiempo real de datos y autenticación, proporcionando una experiencia fluida y segura para todos los perfiles de usuario.

## Características

- **Interfaz de usuario intuitiva:**  
  Desarrollada en React Native con Expo, optimizada para dispositivos móviles.

- **Gestión en tiempo real:**  
  Uso de Firestore para actualizaciones instantáneas de pedidos, productos y usuarios.

- **Control de roles:**  
  Cada usuario accede a funcionalidades específicas según su rol, garantizando seguridad y eficiencia operativa.

- **Flujo completo POS:**  
  - Pedidos realizados por clientes.
  - Preparación y gestión de órdenes por parte del personal.
  - Procesamiento de pagos y generación de recibos.
 
## Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/)
- [Firebase](https://youtu.be/p9pgI3Mg-So?si=fwTH-6jlHmwmhY0K)
- [SupabaseStorage](https://supabase.com/docs/guides/storage) o [FirebaseStorage](https://www.youtube.com/watch?v=-IFRVMEhZDc)
- ENV variables [Expo-env](https://docs.expo.dev/guides/environment-variables/)

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/1JuL/posapp.git
   ```
   cd posapp

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Tecnologías Utilizadas

### React Native & Expo:
Plataforma para el desarrollo de aplicaciones móviles multiplataforma.

### Firebase:

- Firestore: Almacenamiento y consulta en tiempo real.

- Firebase Auth: Autenticación de usuarios.
  

## Uso
La aplicación se divide en módulos específicos según el rol del usuario:

- Cliente:
Visualiza el menú, escanea el QR de la mesa, agrega productos al carrito y realiza pedidos.

- Chef:
Gestiona y actualiza el estado de las órdenes en tiempo real, tambien puede gestionar el menu.

- Mesero:
Gestiona la entrega de pedidos y actualiza su estado.

- Cajero:
Procesa los pagos, genera recibos y cambia el estado de las órdenes como Pagadas.

- Administrador:
Accede a un dashboard para gestionar usuarios y el menú, pudiendo realizar operaciones CRUD, Tiene acceso a todos los flujos de la aplicacion (chefs, meseros y cajeros)
para poder hace seguimiento de los pedidos, adicionalmente puede visualizar el historial de ordenes y recibos.
