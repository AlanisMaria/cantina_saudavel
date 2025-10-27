self.addEventListener("install", event => {
    console.log("service worker instalado");
 });

self.addEventListener("activate", event => {
    console.log("service worker ativado");
});

self.addEventListener ("fetch" , event => {

});