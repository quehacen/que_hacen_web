que_hacen_web
=============

Sitio web de Que Hacen los Diputados

![Logotipo del sitio web quehacenlosdiputados](http://quehacenlosdiputados.net/images/quehacenlosdiputados.jpg)

## Requisitos para la puesta en produccion del proyecto:

* [Nginx](http://nginx.org/) ó [Apache HTTP Server](http://httpd.apache.org/)
* [node.js](http://nodejs.org/)
* [MongoDB](http://www.mongodb.org/)

## Cómo funciona

### Servidor HTTP
Necesitamos un servidor HTTP que recoja las llamas y ser redirijan dichas llamadas mediante un proxy inverso, a las aplicaciones node.js que estan corriendo en ell servidor.

Además es necesario tener **activado SSI (Sever Side Includes)** para hacer funcionar correctamente la aplicacion node.js que corresponde al portal, ya que dicha aplicación hace uso de modulos reutilizables que se incluyen en distintas vistas.

### La web se compone de dos aplicaciones desarrolladas en node.js:
* una api pública que accede a la base de datos para recopilar los datos requeridos [https://github.com/quehacen/que_hacen_api](https://github.com/quehacen/que_hacen_api)
* un portal que representa los datos accediendo a la api (SSI activado en el servidor HTTP) [https://github.com/quehacen/que_hacen_web](https://github.com/quehacen/que_hacen_web)

### La arquitectura que actualmente usamos en el portal es la siguiente:
- un servidor web nginx que recoge las peticiones del cliente y redirige dichas peticiones mediante proxies inversos basados en urls, a la aplicación node.js correspondiente, las cuales corren en puertos diferentes.

browser <===> Servidor HTTP <===> portal web(node.js) | api(node.js) <===> MongoDB

Un ejemplo se produce cuando se hace una llamada a [quehacenlosdiputados.net/diputados](http://quehacenlosdiputados.net/diputados):

* nginx redirige la petición a la aplicación node.js que esta corriendo en el puerto 3001 que es la del portal, 
* ésta llama a la api, la otra aplicacion node.js que esta corriendo en el puerto 3002, 
* que recoge la información de los diputados de la Base de Datos y la entrega a la primera aplicación que se encargará de mostrarla al cliente.

Cuando se hace una llamada a la [api.quehacenlosdiputados.net/diputados](http://api.quehacenlosdiputados.net/diputados):

* nginx redirige esa llamada a la api, la otra aplicación node.js que esta corriendo en el puerto 3002
* que recoge la información de la Base de Datos y la muestra tal cual.


## Utilidades

Para la gestión de dichas aplicaciones nosotros utilizamos [PM2](http://httpd.apache.org/) que es una herramienta que consideramos muy util, no solo por la buena gestion interna que hace de dichos procesos (graceful shutdown, balanceo de procesos, monitorizacion, salida a logs, ...), ademas facilita la configuración de dichos procesos desde el terminal o desde un archivo de configuración externo.

## Licencia

La aplicación de este repositorio se distribuye bajo licencia GPLv3 [http://www.gnu.org/licenses/gpl.txt](http://www.gnu.org/licenses/gpl.txt)
