$(document).ready(function(){
  // console.log($("#foo").value);
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
/* DOM UPDATING INTERVALS */
function update_dom(){
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
          item_markup += '<form id="' + id + '" class="item col-sm-12 col-lg-12" action="api/items/" method="POST">';
          item_markup += '<input type="hidden" name="csrfmiddlewaretoken" value="' + csrf_func() + '" />';
          item_markup += '<div class="pull-left" id="item_' + id + '">' + name + '</div>';
          item_markup += '<span class="badge pull-right"># of purchases: ' + times_purchased + '</span>';
          item_markup += "<div class='purchase_btn col-sm-4 pull-right' onclick='purchase_item("+id+")'>"+"Purchase"+"</div>"
          item_markup += '</form>';
          
        }
        $(".items").html(item_markup);
        var purchased_items = "";
        for(var i = 0; i < data.purchased_length; i++){
          purchased_items += '<div class="row purchases">';
          purchased_items += "<div class='col-md-3 col-lg-3'>" + data.purchased_items_names[i] + "</div>"
          purchased_items += "<div class='col-md-3 col-lg-3'>" + data.purchased_date_created[i] + "</div>"
          purchased_items += "</div>";
        }
        $("#purchased_items").html(purchased_items);
        if (data.total == 0){
            $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
        } else {
            $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
        }
        $("#purchases_header").html("<h3>Purchases Made: All Time ("+data.purchased_length+")");
      },
      failure: function(){
        console.log("fail");
      },
  });
}
setInterval(update_dom, 3000);

setInterval(function(){
    var latest_action_div = $("#latest_action");
    $.ajax({
      url: '/api/actions/',
      type: "GET",
      success: function(data){
          // console.log(data.latest_action_object_name);
          if (data.no_actions){
            latest_action_div.text("Nothing To Undo");
            latest_action_div.attr("onclick", "undo(\'none\')");
          } else {
            latest_action_div.text("Undo: \'"+ data.latest_action_object_name+"'");
            latest_action_div.attr("onclick", "undo(\'"+data.latest_action_undo_handler+"\')");
          }
      },
      failure: function(){
        console.log("fail");
      },
    });
}, 3000);

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
    success: function(data){
      console.log(data);
      if (data.invalid_form_data){
        $("#item_form_header").html("<p class='text-danger'>Invalid Form</p>");
      } else if (data.success) {
        $("#item_form_header").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
        create_action("Create Item", "Create Item: "+name, "undo add item");
      } 
    },
    failure: function(){
      console.log("fail");
    },
  });
  document.getElementsByClassName('item_form')[0].reset();
  update_dom()
};

function purchase_item(id){
  /*
  Creates a new purchase object by POST with Ajax.
  Also increases the int on the btn.
  */
  var form = $("#"+id)[0];
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
          create_action("Purchase", "Make purchase: "+name, "undo purchase");
      },
      error: function(){
          console.log("failure");
      },
  });
};

function undo(undo_handler){
    if (undo_handler == "undo purchase"){
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "undo": true,
                "object_name": "Purchase",
                "undo_handler": undo_handler,
            },
            success: function(data){
                console.log("successful undo");
                console.log(data.item_purchased);
                $("#header").html("<p style='color: green;'>Purchase for:&emsp;" + data.item_purchased + "&emsp; Deleted<span class='fa fa-check'></></p>");
            },
            error: function(){
                console.log("failure");
            },
        })
    } else if (undo_handler == "undo add item") {
      console.log("UNDO ADD ITEM");
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "undo": true,
                "object_name": "Create Item",
                "undo_handler": undo_handler,
            },
            success: function(data){
                console.log("successful undo");
                console.log("data.deleted_item_name: ", data.deleted_item_name);
                $("#header").html("<p style='color: green;'>Item:&emsp;" + data.deleted_item_name + "&emsp; Deleted<span class='fa fa-check'></></p>");
            },
            error: function(){
                console.log("failure");
            },
        })
    } else if (undo_handler == "none"){
      console.log("doing nothing");
    }
  update_dom();
}

function create_action(title, object_name, undo_handler){
    $.ajax({
        type:"POST",
        url:"/api/actions/",
        data: {
            "create_action": true,
            "title": title,
            "object_name": object_name,
            "undo_handler": undo_handler,
            "csrfmiddlewaretoken": csrf_func(),
        },
        success: function(data){
          console.log("success")
        },
        failure: function(){
          console.log("fail");
        },
    })
    update_dom();
}
