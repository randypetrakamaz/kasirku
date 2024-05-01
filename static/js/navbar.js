const topbar = 
{
    view: "toolbar", padding: 5, paddingX: 10, maxHeight: 60, elements: [
        {view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: function(){
            $$("$sidebar1").toggle();
            }
        },
        {view: "label", label: "My Kasir", css: "header_title"}
    ]
};

export default topbar;