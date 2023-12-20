// import { loadFeature, appendNavBar } from "../base";

// loadFeature("help", false, function () {
//     helpInfo();
//     return true;
// });

// function helpInfo() {
//     initFeatureInfoModal();
//     $("body").on("click", "#showFeatureInfo", showFeatureInfo);
// }

// function showFeatureInfo() {
//     var data = [
//         {
//             title: "数据对比",
//             img: [
//                 "https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/doc/change-diff-1.png",
//                 "https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/doc/change-diff-2.png"
//             ],
//         },
//         {
//             title: "namespace跳转",
//             img: ["https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/doc/gotoNamespace.png"],
//         },
//     ];
//     var content = '<div class="panel-group" id="help-accordion" role="tablist" aria-multiselectable="true">';
//     for (const i in data) {
//         const val = data[i];
//         const imgs = _.isArray(val.img) ? val.img : [val.img]
//         let t = ''
//         for (const img of imgs) {
//             t += `<img class="img-responsive" src="${img}"/>`
//         }
//         content += `
//       <div class="panel panel-default">
//         <div class="panel-heading" role="tab" id="healpHeading-${i}">
//             <h4 class="panel-title">
//             <a role="button" data-toggle="collapse" data-parent="#help-accordion" 
//             onclick="$('#helpCollapse-${i}').collapse('toggle');" aria-controls="helpCollapse-${i}">
//             ${val.title}
//             </a>
//             </h4>
//         </div>
//         <div id="helpCollapse-${i}" class="panel-collapse collapse out" role="tabpanel" aria-labelledby="healpHeading-${i}">
//             <div class="panel-body">
//             ${t}
//             </div>
//         </div>
//       </div>
//       `
//     }
//     content += "</div>"
//     $("#helpModalBody").html(content);
//     $("#helpModal").modal();
// }
// function initFeatureInfoModal() {
//     $("body").append(`
//     <!-- Modal -->
//     <div class="modal fade" id="helpModal" tabindex="-1" role="dialog" aria-labelledby="" style="z-index:9999;">
//       <div class="modal-dialog modal-lg" role="document">
//         <div class="modal-content">
//           <div class="modal-header">
//             <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
//             <h4 class="modal-title">apollo-enhance 功能说明</h4>
//           </div>
//           <div class="modal-body" id="helpModalBody">
             
//           </div>
//         </div>
//       </div>
//     </div>
//     `);
// }