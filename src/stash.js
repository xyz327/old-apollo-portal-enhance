// import { loadFeature, onNamesacpeLoaded } from "./base";
// loadFeature("stash", true, function () {
//   onNamesacpeLoaded(function () {
//     console.log("stash");

//     $.each(
//       $("section.master-panel-body.ng-scope>.panel-heading>"),
//       function (idx, el) {
//         console.log(el);
//         var namespaceName = $(el)
//           .find("b.namespace-name.ng-binding")
//           .text()
//           .trim();
//         var namespaceScope = $(
//           'div[ng-controller="ConfigNamespaceController"]'
//         ).scope();
//         var ConfigService = angular
//           .injector(["application"])
//           .get("ConfigService");
//         var namespace = namespaceScope.namespaces.find(
//           (e) => e.baseInfo.namespaceName === namespaceName
//         );
//         var modified = namespace.itemModifiedCnt > 0;
//         if (modified) {
//           $(`
//             <button type="button" class="btn btn-warning btn-sm">
//             <span class="glyphicon glyphicon-save"></span>
//             暂存改动</button>
//             `)
//             .on("click", function () {
//               console.log(namespaceName);
//               console.log(namespace);
//               stash(namespace);
//             })
//             .prependTo($(el).find(".header-buttons"));
//           var $menu = $(el).find(".dropdown-menu");
//           $menu.append('<li role="separator" class="divider"></li>');
//           $(`
//             <li><a href="javascript:void(0);" class=" btn-warning"><span class="glyphicon glyphicon-save"></span>暂存改动</a></li>
//             `)
//             .on("click", function () {
//               layer.confirm("是否要暂存改动?", function (index) {
//                 console.log(namespaceName);
//                 console.log(namespace);
//                 console.log(ConfigService);
//                 var newVals = {};
//                 var items = namespace.items.filter((item) => item.isModified);
//                 items.forEach((item) => {
//                   newVals[item.item.key] = {
//                     value: item.newValue,
//                     isDeleted: item.isDeleted,
//                   };
//                 });
//                 localStorage.setItem(
//                   `stash_${namespaceName}`,
//                   JSON.stringify(newVals)
//                 );
//                 // recovery old value
//                 Promise.all(
//                   items.forEach((item) => {
//                     return ConfigService.update_item(
//                       namespace.baseInfo.appId,
//                       namespaceScope.pageContext.env,
//                       namespace.baseInfo.clusterName,
//                       namespace.baseInfo.namespaceName,
//                       item
//                     );
//                   })
//                 ).then(() => {
//                   layer.close(index);
//                   layer.msg("改动暂存成功!");
//                 });
//               });
//             })
//             .appendTo($menu);
//           $(`
//             <li><a href="#" class=" btn-warning"><span class="glyphicon glyphicon-save"></span>恢复暂存改动</a></li>
//             `).appendTo($menu);
//         }
//       }
//     );
//   });
// });

// $("body").append(`
// <!-- Modal -->
// <div class="modal fade" id="stashModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
//   <div class="modal-dialog modal-lg" role="document">
//     <div class="modal-content">
//       <div class="modal-header">
//         <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
//         <h4 class="modal-title"><span class="text-danger" id="diff-detail-title"></span> 差异对比</h4>
//       </div>
//       <div class="modal-body" >
//           <div class="row">
//             <div class="col-xs-6 text-center">
//               <span data-tooltip="tooltip" title="点击复制" id="copyOld" data-copy="copy" data-copy-value=""  class="label label-default">旧值 
//               <label class="glyphicon glyphicon-duplicate"></label>
//               </span>
//             </div>
//             <div class="col-xs-6 text-center">
//               <span data-tooltip="tooltip" title="点击复制" id="copyNew" data-copy="copy" data-copy-value="" class="label label-success">新值
//               <label class="glyphicon glyphicon-duplicate"></label>
//               </span>
//             </div>
//           </div>
//           <div id="diff-container" style="display:flex"></div>
//       </div>
//     </div>
//   </div>
// </div>
// `);
