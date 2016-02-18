var update_items = setInterval(function(){
  $.ajax({
      type: "GET",
      url: "/api/items",
      success: function(data){
        var item_markup = "";
        for (var i = 0; i < data.length; i++){
          var name = data.names[i];
          var company = data.companies[i];
          var price = data.prices[i];
          var times_purchased = data.times_purchased[i];
          var id = data.id[i];
          item_markup += '<form id="' + id + '" class="item" action="api/items/" onclick="itemclick(this)" method="POST">';
          item_markup += '<div class="pull-left">' + name + '</div>';
          item_markup += '<span class="badge pull-right">' + times_purchased + '</span><br />';
          item_markup += '</form>';
        }
        $(".items").html(item_markup);
      }
  });
}, 10000);
function send_new_item(form){
  var url = form.action;
  var form_data = $(form).serializeArray();
  var name = form_data[1].value;
  $.post(url, form_data);
  $("#item_form_header").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
  document.getElementsByClassName('item_form')[0].reset();
};
function itemclick(form){
  var url = form.action;
  console.log(form);
  var form_data = $(form).serializeArray();
  console.log("form_data", form_data);
  // var name = form_data[1].value;
  $.ajax({
      type: 'POST',
      url: url,
      data: {
          "csrfmiddlewaretoken": form_data[0].value,
          "id": form.id,
      },
      success: function(){
          console.log("success");
      },
      error: function(){
          console.log("failure");
      }
  });
  $.ajax({
      type: 'GET',
      url: url,
      data: {
          "csrfmiddlewaretoken": form_data[0].value,
      },
      success: function(data){
          console.log("success");
          console.log(data);
          $("#purchased_items").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
      },
      error: function(){
          console.log("failure");
      }
  });
};