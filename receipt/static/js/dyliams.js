var collect_items = setInterval(function(){
  $.ajax({
      type: "GET",
      url: "/api/items",
      success: function(data){
        var item_markup = "";
        for (var i = 0; i < data.length; i++){
          var name = data.names[i]
          var company = data.companies[i]
          var price = data.prices[i]
          var times_purchased = data.times_purchased[i]
          item_markup += "<div class='item'><div class='pull-left'>" + name + " " + company + " " + price + "</div><span class='badge pull-right'>" + times_purchased + "</span></div><br />"
        }
        $(".items").html(item_markup);
      }
  });
}, 5000)
function send_new_item(form){
  var url = form.action;
  var form_data = $(form).serializeArray();
  var name = form_data[1].value;
  $.post(url, form_data);
  $("#item_form_header").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
  document.getElementsByClassName('item_form')[0].reset();
}