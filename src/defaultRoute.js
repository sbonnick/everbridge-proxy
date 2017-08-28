
function response(request, app) {
    var routelist = [];
  var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
     routelist.push(fullUrl + r.route.path.replace(/^\//, ""))
    }
  })
  return {routes: routelist};
}

module.exports = {
    response: response
}