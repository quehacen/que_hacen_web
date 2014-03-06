	function poda_con(input,field,val){
           var anew=[];
           if(arguments.length!=3){
              __.each(input,function(elem){
                 __.each(elem,function(value,key,list){
                    if(key == field){
                       anew.push(elem);
                    }
                 });
              });
           }else{
              __.each(input,function(elem){
                 __.each(elem,function(value,key,list){
                    if(key == field && value == val){
                        anew.push(elem);
                    }
                 });
              });
           }
           return anew;
        }

	function poda_sin(input,field,val){
           var anew=[];
           var inside;
           if(arguments.length!=3){
              __.each(input,function(elem){
                 inside=false;
                 __.each(elem,function(value,key,list){
                    if(key == field){
                       inside=true;
                    }
                 });
                 if(inside==false){anew.push(elem);}
              });
           }else{
              __.each(input,function(elem){
                 __.each(elem,function(value,key,list){
                    if(key == field && value != val){
                        anew.push(elem);
                    }
                 });
              });
           }
           return anew;
        }


	function dipusorg(input,idorg){
           var dipusorg=[];
           var temp,fila;
           __.each(input,function(dipu){
                __.each(dipu.cargos_congreso,function(c){
                        if(c.idOrgano==idorg){
                                temp={}
                                __.each(dipu,function(value,key,list){
                                        if(key!="cargos_congreso"){
                                                temp[key]=value;
                                        }
                                });
                                temp.cargo=c.cargo;
                                temp.alta=c.alta;
                                if(typeof c.baja !== "undefined"){temp.baja=c.baja;}
                                dipusorg.push(temp);
                                delete temp;
                        }
                });
           });
           return dipusorg;
        }

