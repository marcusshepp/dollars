$(document).ready(function(){
  console.log($("#foo").value);
  $("#foo").value = "foo";
});

var csrf_func = function(){
  /* Grab cookie containing {% csrf_token %} django specific */
  var csrf = $.cookie("csrfmiddlewaretoken");
  var wrapper = document.createElement("div");
  wrapper.innerHTML = csrf;
  var csrf_element = wrapper.firstChild;
  return csrf_element.value;
}

var update_items = setInterval(function(){
  /*
  UPDATES DOM
  Ajax request to the items API.
  Populates the page with available items & purchases & total.
  */
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
          item_markup += '<form id="' + id + '" class="item" action="api/items/" onclick="purchase_item(this)" method="POST">';
          item_markup += '<input type="hidden" name="csrfmiddlewaretoken" value="' + csrf_func() + '" />';
          item_markup += '<div class="pull-left" id="item_' + id + '">' + name + '</div>';
          item_markup += '<span class="badge pull-right">' + times_purchased + '</span><br />';
          item_markup += '</form>';
        }
        $(".items").html(item_markup);
        var purchased_items = ""
        for(var i = 0; i < data.purchased_length; i++){
          purchased_items += '<div class="purchases">';
          purchased_items += "<div class='col-md-6 col-lg-6'>" + data.purchased_items_names[i] + "</div>"
          purchased_items += "<div class='col-md-6 col-lg-6'>" + data.purchased_date_created[i] + "</div>"
          purchased_items += "</div>";
        }
        $("#purchased_items").html(purchased_items);
        if (data.total == 0){
            $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
        } else {
            $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
        }
      }
  });
}, 5000);

function send_new_item(form, purchase){
  /*
  Ajax POST to items API. View then creates a new item object.
  */
  var form_data = $(form).serializeArray();
  var name = form_data[1].value;
  var company_came_from = form_data[2].value;
  var price = form_data[3].value;
  $.ajax({
    type: 'POST',
    url: '/item/',
    data: {
      "csrfmiddlewaretoken": csrf_func(),
      "name": name,
      "company_came_from": company_came_from,
      "price": price,
      "purchase": purchase,
    },
    success: function(){
      console.log("success");
    }
  });
  $("#item_form_header").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
  document.getElementsByClassName('item_form')[0].reset();
  $.ajax({
      type: 'POST',
      url: '/api/actions/',
      data: {
          "create_item_action": true,
          "csrfmiddlewaretoken": csrf_func(),
          "title": "Create Item",
          "object_name": "Item",
      },
      success: function(){
          console.log("success");
      }
  })
};

function purchase_item(form){
  /*
  Creates a new purchase object by POST with Ajax.
  Also increases the int on the btn.
  */
  var url = form.action;
  var form_data = $(form).serializeArray();
  $.ajax({
      type: 'POST',
      url: '/api/items/',
      data: {
          "csrfmiddlewaretoken": csrf_func(),
          "id": form.id,
      },
      success: function(){
          var name = $("#item_" + form.id).html()
          $("#header").html("<p style='color: green;'>Purchase Made:&emsp;" + name + "&emsp;<span class='fa fa-check'></></p>");
          create_action("Make purchase: "+name, "Item + Purchase", form.id);
      },
      error: function(){
          console.log("failure");
      },
  });
  create_action("Purchase", "Purchase", form.id, "undo purchase");
};

function undo(id, item_name){
    if (item_name == "Purchase"){
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "id": id,
                "undo": true,
                "object_name": "Purchase",
                'purpose': "undo purchase",
            },
            success: function(data){
                var name = $("#item_" + id).html()
                $("#header").html("<p style='color: green;'>Purchase for:&emsp;" + data.item_purchased + "&emsp; Deleted<span class='fa fa-check'></></p>");
            },
            error: function(){
                console.log("failure");
            },
        })
    } else if (item_name == "Item") {
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "id": id,
                "undo": true,
                "object_name": "Item",
            },
            success: function(){
                var name = $("#item_" + id).html()
                $("#header").html("<p style='color: green;'>Purchase for:&emsp;" + name + "&emsp; Deleted<span class='fa fa-check'></></p>");
            },
            error: function(){
                console.log("failure");
            },
        })
    }

}

setInterval(function(){
    var latest_action_div = $("#latest_action");
    var action_title = $.get('/api/actions/', function(data){
        console.log(data.latest_action_title);
        latest_action_str = "";
        latest_action_str += '<input type="button" class="btn btn-success col-xs-6" value=" Undo: \''+data.latest_action_title+'\'"';
        latest_action_str += ' onclick="undo('+data.latest_action_object_id+','+data.latest_action_object_name+')">';
        latest_action_div.html(latest_action_str);
    });
}, 5000);

var create_action = function(title, object_name, object_id, purpose){
    $.ajax({
        type:"POST",
        url:"/api/actions/",
        data: {
            "title": title,
            "object_name": object_name,
            "object_id": object_id,
            "csrfmiddlewaretoken": csrf_func(),
            "purpose": purpose,
        },
        success: function(data){
            console.log("success");
            console.log(data.success);
        },
    })
}
