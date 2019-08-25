      function isHooked(obj, key) {
        if (typeof key === "symbol") return false;
        if (key.startsWith("$$")) return false;
        if (key in obj.__proto__) return false;
        if (Array.isArray(obj)) {
          return !isNaN(key);
        }
        return true;
      }

      function inPrototype(key) {
        return (
          key in ChomRef.prototype &&
          typeof ChomRef.prototype[key] === "function"
        );
      }
      
      function wrapToArray(x) {
        return x.$$chomRef ? [x] : Array.isArray(x) ? x : [x];
      }

      class ChomRefHandler {
        constructor(hookerReceiver) {
          this.hookerReceiver = hookerReceiver;
          this.dep = [];
        }
        
        beforeGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) { }
        afterGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        
        beforeSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) {}
        afterSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) {}
        
        beforeDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        afterDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        
        addDep(ref, hookname) {
          this.dep.push(ref);
          ref.$$hook(hookname, this);
        }
        
        refreshHookerReceiver() {
          this.hookerReceiver = this.hookerReceiver.$$;
          //console.log("hooker", this)
        }
      }
      
      class ChomRefCustomHandler extends ChomRefHandler {
        constructor(hookerReceiver, {beforeGet, afterGet, beforeSet, afterSet, beforeDelete, afterDelete}) {
          super(hookerReceiver);
          
          this._beforeGet = beforeGet;
          this._afterGet = afterGet;
          this._beforeSet = beforeSet;
          this._afterSet = afterSet;
          this._beforeDelete = beforeDelete;
          this._afterDelete = afterDelete;
        }
        
        beforeGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) { if (typeof this._beforeGet === "function") this._beforeGet({hooker, target, hookerReceiver, targetReceiver}); }
        afterGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) { if (typeof this._afterGet === "function") this._afterGet({hooker, target, hookerReceiver, targetReceiver}); }
        
        beforeSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) { if (typeof this._beforeSet === "function") this._beforeSet({hooker, target, hookerReceiver, targetReceiver, value}); }
        afterSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) { if (typeof this._afterSet === "function") this._afterSet({hooker, target, hookerReceiver, targetReceiver, value}); }
        
        beforeDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) { if (typeof this._beforeDelete === "function") this._beforeDelete({hooker, target, hookerReceiver, targetReceiver}); }
        afterDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) { if (typeof this._afterDelete === "function") this._afterDelete({hooker, target, hookerReceiver, targetReceiver}); }
      }
      
      class ChomRefElement extends ChomRefHandler {
        constructor(hookerReceiver, parent, beforeBuild=(()=>{})) {
          super(hookerReceiver);
          beforeBuild.call(this);
          this.pureid = Math.floor(Math.random()*100000000);
          this.parent = wrapToArray(parent);
          //console.log(hookerReceiver, this.parent);
          this.performBuild();
          this.performUpdate();
          /*this.parentEle = [];
          for(var ele of this.parent) {
            if (ele instanceof HTMLElement) {
              parentEle.push(ele);
            } else {
              if (ele.$$chomRef) {
                
              } else {
                parentEle.push(ele);
              }
            }
          }
          for(var ele of this.parentEle) {
            this.performBuild(ele);
          }*/
          
        }
        
        build(ref=this.hookerReceiver) {
          return false;
        }
        
        performBuildSingle(parent, ref=this.hookerReceiver, appendNow=true) {
          //console.log(ref, parent, parent.$$chomRef);
          if (parent instanceof HTMLElement) {
            if (parent.querySelector(":scope > .chomref-ele-pureid-"+this.pureid)) return;
            var res = this.build(ref);
            if (res && res.ele) {
              res.ele = wrapToArray(res.ele);
              for(var ele of res.ele) {
                ele.classList.add("chomref-ele-pureid-"+this.pureid);
                if (appendNow) parent.appendChild(ele)
              }
              if (!this.ele) this.ele = [];
              this.ele = [...this.ele, ...res.ele];
              if (res.childContainer) {
                res.childContainer = wrapToArray(res.childContainer);
                if (!this.childContainer) this.childContainer = [];
                this.childContainer = [...this.childContainer, ...res.childContainer];
              }
            }
            return res;
          } else if (parent.$$chomRef) {
            var $$eleAll = parent.$$ele;
            //console.log($$eleAll);
            for(var $$eleKey in $$eleAll) {
              var $$ele = $$eleAll[$$eleKey];
              var childContainer = $$ele.childContainer;
              //console.log($$ele)
              if (childContainer) {
                //console.log(childContainer)
                for(var parentEle of childContainer) {
                  //console.log(parentEle);
                  var res = this.performBuildSingle(parentEle, ref, false);
                  if (res && res.ele) {
                    for(var ele of res.ele) {
                      //console.log(ref, ele, parentEle)
                      $$ele.performAddChild(ref, ele, parentEle);
                    }
                  }
                }
              }
            }
          } else {
            throw new Error("Parent must be HTMLElement or ChomRef but got: "+parent);
          }

        }
        
        performBuild(ref=this.hookerReceiver) {
          for(var x of this.parent) {
            //console.log(x);
            this.performBuildSingle(x, ref);
          }
        }
        
        afterAttached(ref=this.hookerReceiver) {
          
        }
        
        update(ele, ref=this.hookerReceiver) {
          
        }
        
        performUpdate(ele=this.ele, ref=this.hookerReceiver) {
          
          if (ele) {
            for(var e of ele) {
              //console.log("performUpdate", e)
              this.update(e, ref);
            }
          }
        }
        
        addChild(ref, childEle, childContainer) {
          childContainer.appendChild(childEle);
          return childEle;
        }
        
        performAddChild(ref, childEle, childContainer) {
          var childGroup = [];
          if (childContainer) {
            var e = childContainer;
            //for(var e of childContainer) {
              var subGroup = e.querySelectorAll(":scope > .chref-ele-key-"+ref.$$key);
              //console.log(subGroup);
              if (subGroup.length == 0) {
                subGroup = this.addChild(ref, childEle, childContainer);
                if (!Array.isArray(subGroup)) subGroup = [subGroup]
              }
              childGroup = [...childGroup, ...subGroup];
            //}
          }
          for(var child of childGroup) {
            child.classList.add('chref-ele-order-'+ref.$$key)
            child.classList.add('chref-ele-key-'+ref.$$key)
            child.style.order = parseInt(ref.$$key);
          }
        }
        
        beforeGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        afterGet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        
        beforeSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) {}
        afterSet({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver, value}) {
          //console.log("afterSet", {hooker, target, hookerReceiver, targetReceiver, value})
          this.performBuild(this.parentEle);
          this.performUpdate();
        }
        
        beforeDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {}
        afterDelete({hooker=this.hookerReceiver.$$, target, hookerReceiver=this.hookerReceiver, targetReceiver}) {
          for(var ele of this.ele) {
            //console.log(ele, ele.parentNode);
            if (ele.parentNode) {
              ele.parentNode.removeChild(ele);
            }
          }
          this.ele = undefined;
          this.childContainer = undefined;
        }
      }

      class ChomRefTemplate {
        $$get() {
          return this.$$parent[this.$$parentKey];
        }

        $$set(value) {
          this.$$parent[this.$$parentKey] = value;
          return this.$$get();
        }
        
        $$performHookSingle(fname, moreargs = {}) {
          //if (fname==="afterSet") console.log("performHook", fname, this)
          var hookFunc = this.$$hookFunc;
          for(var key in hookFunc) {
            if (!hookFunc[key][fname].locked) {
              hookFunc[key][fname].locked = true;
              if (fname === "afterSet") hookFunc[key].refreshHookerReceiver();
              moreargs.target = moreargs.targetReceiver.$$;
              hookFunc[key][fname](moreargs);
              hookFunc[key][fname].locked = false;
            }
          }
        }
        
        $$performHookBP(fname, moreargs = {}) {
          this.$$performHookSingle(fname, moreargs);
          if (!this.$$parent) return;
          this.$$parent.$$performHookBP(fname, moreargs);
        }
        
        $$performHook(fname, moreargs = {}) {
          moreargs = {targetReceiver: this, ...moreargs};
          //if (fname==="afterSet") console.log("performHookWrapper", fname, this);
          if (fname === "afterSet" || fname === "beforeSet") this.$$performHookBP(fname, moreargs);
          else this.$$performHookSingle(fname, moreargs);
        }
        
        $$hook(name, fname, fn) {
          var hookFunc = this.$$hookFunc;
          if (typeof fn === "undefined") {
            if (fname instanceof ChomRefHandler) {
              hookFunc[name] = fname;
            } else {
              hookFunc[name] = new fname(this);
            }
          } else {
            hookFunc[name] = new ChomRefCustomHandler(this, {[fname]: fn});
          }
          //Reflect.set(hookFunc, name, 888)
          //console.log(this,hookFunc)
        }
        
        $$childPerform(name, fn) {
          this.$$childPerformFunc[name] = fn;
          for(var key in this) {
            fn(this[key]);
          }
        }
        
        $$doChildPerform(child) {
          //console.log("dcp", child);
          for(var key in this.$$childPerformFunc) {
            this.$$childPerformFunc[key](child);
          }
        }
        
        $$attachEle(name, eleClass, parentEle) {
          //console.log("parentEle", name, parentEle)
          if (this.$$ele[name]) return;
          var ele = new eleClass(this,parentEle);
          this.$$hook(name, ele);
          this.$$ele[name] = ele;
          ele.afterAttached(this);
        }
        
        $$construct() {
          
        }
      }

      var proxyHandler = {
        get(obj, key, receiver) {
          //if (isHooked(obj, key)) console.log("GET", key, obj);
          
          if (key === "$$raw") return obj;
          if (key === "$$chomRef") return true;
          if (key === "valueOf") return Reflect.get(obj, Symbol.toPrimitive);
          if (key === "$$key") return Reflect.get(obj, "$$parentKey");
          if (typeof key === "symbol") return Reflect.get(...arguments);
          if (key in obj.__proto__) return Reflect.get(obj, key);
          
          //key = String(key);

          var classTemplate = Reflect.get(obj, "$$class");

          if (
            key in classTemplate.prototype &&
            typeof classTemplate.prototype[key] === "function"
          ) {
            //console.log("this", receiver);
            return classTemplate.prototype[key].bind(receiver);
          }

          var curr = Reflect.get(...arguments);
          
          if (isHooked(obj, key) && typeof curr === "undefined") {
            Reflect.set(obj, key, ChomRef(undefined, {
              parent: receiver,
              parentKey: key,
              root: Reflect.get(obj, "$$root")
            }))
            curr = Reflect.get(...arguments);
          }
          
          var parent = Reflect.get(obj, "$$parent");
          var parentKey = Reflect.get(obj, "$$parentKey");

          if (key.startsWith("$$getRaw$")) {
            key = key.substr(9);
            //console.log('getRaw', key, obj);
            var raw = Reflect.get(obj, key);
            //if (!raw) return raw;
            if (raw && raw.$$chomRef) {
              return raw;
            } else {
              var res = ChomRef(raw, {
                parent: receiver,
                parentKey: key,
                root: Reflect.get(obj, "$$root"),
                classTemplate: Reflect.get(obj, "$$childClassTemplate")
              });
              Reflect.set(obj, key, res);
              return res;
            }
            //return 5;
          }
          if (key === "$$") return classTemplate.prototype.$$get.call(receiver);
          if (key.startsWith("$$") && key !== "$$mark") return Reflect.get(...arguments);
          if (typeof parent === "undefined") {
            var res = Reflect.get(obj, key);
          } else {
            var res = parent["$$getRaw$" + parentKey]["$$getRaw$" + key];
          }
          if (isHooked(obj, key)) {
            //console.log("GET", key, obj);
            var performHook = res.$$performHook;
            performHook("afterGet");
          }
          return res;
        },
        set(obj, key, value, receiver) {
          /*if (value.$$chomRef) {
            console.log("found bug")
            value = value.$$get();
          }*/
          
          //console.log("SET", key, value, obj);
          if (!isHooked(obj, key)) {
            return Reflect.set(...arguments);
          }
          
          var curr = receiver[key];
          if (isHooked(obj, key)) {
            //console.log("SET", key, value, obj);
            var performHook = curr.$$performHook;
            performHook("beforeSet", {value});
          }
          var $$hookFunc = {};
          var $$childPerformFunc = {};
          var $$ele = {};
          if (curr && curr.$$chomRef) {
            $$hookFunc = curr.$$hookFunc;
            $$childPerformFunc = curr.$$childPerformFunc;
            $$ele = curr.$$ele;
          }
          var res = Reflect.set(obj, key, ChomRef(value, {
            parent: receiver,
            parentKey: key,
            root: Reflect.get(obj, "$$root"),
            classTemplate: Reflect.get(obj, "$$childClassTemplate"),
            $$hookFunc,
            $$childPerformFunc,
            $$ele
          }));
          curr = Reflect.get(obj, key);
          
          receiver.$$doChildPerform(curr);
          if (isHooked(obj, key)) {
            //console.log("SET", key, value, obj);
            var performHook = curr.$$performHook;
            performHook("afterSet", {value});
          }
          
          return res;
        },
        deleteProperty(obj, key) {
          var curr = Reflect.get(obj, key);
          //console.log(curr);
          var performHook = curr.$$performHook;
          if (isHooked(obj, key)) {
            //console.log("DELETE", obj, key);
            performHook("beforeDelete");
          }
          var res = Reflect.deleteProperty(...arguments);
          if (isHooked(obj, key)) {
            //console.log("DELETE", obj, key);
            performHook("afterDelete");
          }
          return res;
        }
      };

      function ChomRef(value, options) {
        var res;
        
        if (typeof value !== "object") {
          var rawValue = value;
          value = {
            value,
            [Symbol.toPrimitive](hint) {
              return rawValue;
            }
          };
        } else {
          if (Array.isArray(value)) value = [...value];
          else {
            var oldPrototype = value.__proto__;
            value = Object.assign(Object.create(oldPrototype),value);
          }
        }
        
        res = new Proxy(value, proxyHandler);

        if (!options) options = {};
        if (!options.root && !options.allowRoot) {
          options.root = ChomRef({ value: res }, { allowRoot: true });
          options.parent = options.root;
          options.parentKey = "value";
          options.newRoot = true;
        }
        
        var classTemplate = options.classTemplate || ChomRefTemplate;
        var childClassTemplate = options.childClassTemplate || ChomRefTemplate;
        
        /*Object.defineProperty(value, "$$chomRef", {
          value: true,
          enumerable: false,
          writable: true
        });*/

        Object.defineProperty(value, "$$parent", {
          value: options.parent,
          enumerable: false,
          writable: true
        });

        Object.defineProperty(value, "$$parentKey", {
          value: options.parentKey,
          enumerable: false,
          writable: true
        });

        Object.defineProperty(value, "$$root", {
          value: options.root || res,
          enumerable: false,
          writable: true
        });

        Object.defineProperty(value, "$$class", {
          value: classTemplate,
          enumerable: false,
          writable: true
        });
        
        Object.defineProperty(value, "$$childClass", {
          value: childClassTemplate,
          enumerable: false,
          writable: true
        });
        
        Object.defineProperty(value, "$$hookFunc", {
          value: options.$$hookFunc || {},
          enumerable: false,
          writable: true
        });
        
        Object.defineProperty(value, "$$ele", {
          value: options.$$ele || {},
          enumerable: false,
          writable: true
        });
        
        Object.defineProperty(value, "$$mark", {
          value: {},
          enumerable: false,
          writable: true
        });
        
        Object.defineProperty(value, "$$childPerformFunc", {
          value: options.$$childPerformFunc || {},
          enumerable: false,
          writable: true
        });
        
        res.$$construct();
        
        if (options.newRoot) {
          res.$$get();
        }
        
        //if (options.parent) options.parent.$$doChildPerform(res);
        
        return res;
      }

if (typeof module !== "undefined") {
  module.exports = {ChomRef, ChomRefTemplate, ChomRefCustomHandler, ChomRefElement};
}