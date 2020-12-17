var textos = (function(){
    "use strict";
    var lista,
        that = {};
    lista = [
        {'name': 'citas' 
            [            
                {id: 1, valor: 'A'},                
                {id: 2, valor: 'B'},                
                {id: 3, valor: 'C'},                
                {id: 4, valor: 'D'},                
                {id: 5, valor: 'E'},                
                {id: 6, valor: 'F'}
            ]
        }
    ]

    that = (mod,id) => {
        return lista[mod][id];
    }

    return that;
}());