// import { loadFeature, appendNavBar } from "./base";

// loadFeature("help", false, function () {
//      helpInfo();
//     return true;
//   });

// function helpInfo() {
//     initFeatureInfoModal();
//     appendNavBar(`
//     <li>
//     <a href="javascript:void(0);" id="showFeatureInfo">
//     <span class="glyphicon glyphicon-question-sign"></span>
//     </a>
//     </li>
//     `);
//     $("#showFeatureInfo").on("click", showFeatureInfo);
//   }

//   function showFeatureInfo() {
//     var data = [
//       {
//         title: "json格式校验",
//         img: "https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/doc/change-diff-1.png",
//       },
//       {
//         title: "namespace跳转",
//         img: "https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/doc/gotoNamespace.png",
//       },
//     ];
//     var content = "";
//     for (const val of data) {
//       content += `
//       <div class="panel panel-default">
//         <div class="panel-heading">
//           <h3 class="panel-title">${val.title}</h3>
//         </div>
//         <div class="panel-body">
//           <img class="img-responsive" src="${val.img}"/>
//         </div>
//       </div>
//       `;
//     }
//     $("#featureModalBody").html(content);
//     $("#featureModal").modal();
//   }
//   function initFeatureInfoModal() {
//     $("body").append(`
//     <!-- Modal -->
//     <div class="modal fade" id="featureModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
//       <div class="modal-dialog modal-lg" role="document">
//         <div class="modal-content">
//           <div class="modal-header">
//             <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
//             <h4 class="modal-title">apollo-enhance 功能说明</h4>
//           </div>
//           <div class="modal-body" id="featureModalBody">
             
//           </div>
//         </div>
//       </div>
//     </div>
//     `);
//   }