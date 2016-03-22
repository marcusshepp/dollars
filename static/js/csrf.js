var csrf_func = function(){
  /* Grab cookie containing {% csrf_token %} django specific */
  var csrf = $.cookie("csrfmiddlewaretoken");
  var wrapper = document.createElement("div");
  wrapper.innerHTML = csrf;
  var csrf_element = wrapper.firstChild;
  return csrf_element.value;
}
