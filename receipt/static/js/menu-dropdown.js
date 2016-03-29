$(document).ready(function(){
    $(".menu_dropdown_name").click(function(){
        if($(this).hasClass("off")){
            $(".dropdown").show();
            $(this).removeClass("off");
            $(this).addClass("on");
        } else {
            $(".dropdown").hide();
            $(this).removeClass("on");
            $(this).addClass("off");
        }
    });
});
