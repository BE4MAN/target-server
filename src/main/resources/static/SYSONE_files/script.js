$(document).ready(function(){

	/* 메뉴 호버 기능 */
	$(".header-bottom ul li").on("mouseenter", function(){
		$("#gnb").addClass("active");
	});

	$("#gnb").on("mouseleave", function(){		
			$("#gnb").removeClass("active");		
	});

	$(".header-top").on("mouseenter", function(){
		$("#gnb").removeClass("active");
	});

	/* 2depth 슬라이드 기능 */
	$(".no-href").on("click",function(){
		if($(this).hasClass("on")){
			$(this).removeClass("on");
			$(this).siblings("ul").slideUp();
		}else{
			$(".no-href").removeClass("on");
			$(".no-href").siblings("ul").slideUp();
			$(this).addClass("on");
			$(this).siblings("ul").slideDown();
		}
	});

	$(".hamburger").on("click",function(){		
    if($(this).hasClass("is-active")){
    	$(this).removeClass("is-active");
      $("html, body").removeClass("not_scroll");
      $(".mobile-menu").removeClass("on");
    }else{
    	$(this).addClass("is-active");
    	$("html, body").addClass("not_scroll");
    	$(".mobile-menu").addClass("on");
    }
  });

  /* SERVICE 메뉴 제품 없을 시 해당 뎁스 숨기기 */
  $(".gnb-menu .no-href,.mobile-menu .no-href").each(function(){
  	var count = $(this).siblings("ul").length;
  	var count2 = $(this).siblings("ul").find("li").length;
  	var count3 = $(this).siblings("ul").find("a").attr("href");
  	if(count == 1){
  		if(count2 == 1 && count3 == "#"){
  			$(this).parent("li").hide();
  		}	
  	}
  		else{
  		$(this).parent("li").hide();
  	}
  });

  $(".mobile-menu .body > ul > li:first-child ul li a").on("click",function(){
  	var i = $(this).parent("li").index();

  	$(".mobile-menu .body > ul > li:first-child ul li").children("a").removeClass("on");
  	$(".mobile-menu .body > ul > li:first-child ul li").eq(i).children("a").addClass("on");
  	$(".mobile-menu .body > ul > li:last-child > ul").removeClass("on");
  	$(".mobile-menu .body > ul > li:last-child > ul").eq(i).addClass("on");
  });

  /* 모바일 검색 기능 */
  $(".search-icon").on("click",function(){
		$(".search-overlay").addClass("on");		
	});
	$(".search-overlay .close-btn").on("click",function(){
		$(".search-overlay").removeClass("on");		
	});

	/* 텍스트 호버 기능 */
	$(".header-bottom ul li a").on("mouseenter", function(){
		$(this).addClass("on");
	});

	$(".header-bottom ul li a").on("mouseleave", function(){
		$(this).removeClass("on");
	});

	$("header .gnb-menu > li").on("mouseenter", function(){
		var i = $(this).index();		
		$(".header-bottom ul li").eq(i).children("a").addClass("on");
	});	

	$("header .gnb-menu > li").on("mouseleave", function(){
		var i = $(this).index();
		$(".header-bottom ul li").eq(i).children("a").removeClass("on");
	});

	/* 메인 채용 공고 */
	$(".main-content03 .main-board > div > ul > li > a").on("click",function(){
		$(this).siblings("ul").fadeToggle();
		$(this).toggleClass("on");
		if($(this).parent("li").siblings("li").find("a").hasClass("on")){
			$(this).parent("li").siblings("li").find("ul").slideUp();
			$(this).parent("li").siblings("li").find("a").removeClass("on");
		}
	});

	/* 탭 기능 */
	$(".default-tab a").on("click",function(){
		var i = $(this).parent("li").index();
		var cate = $(this).attr("data-cate");
		$(".default-tab li a").removeClass("on");
		$(this).addClass("on");
		$("input[name='cate']").val(cate);
		urls = "./ajax_certi_list.php?page=1&cate="+cate;
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_certi").html(html);

					$('.zoom-gallery').magnificPopup({
						delegate: 'a',
						type: 'image',
						closeOnContentClick: true,
						closeBtnInside: false,
						mainClass: 'mfp-with-zoom mfp-img-mobile',
						image: {
							verticalFit: true,
							titleSrc: function(item) {
								return item.el.attr('title') + ' &middot; <a class="image-source-link" href="'+item.el.attr('data-source')+'" target="_blank">image source</a>';
							}
						},
						gallery: {
							enabled: true
						},
						zoom: {
							enabled: true,
							duration: 300, // don't foget to change the duration also in CSS
							opener: function(element) {
								return element.find('img');
							}
						}			
					});	
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function(){

			}
		});	
	});

	/* 역사관 탭 기능 */
	$(".history-tab a").on("click",function(){
		var i = $(this).parent("li").index();
		$(".history-tab li a").removeClass("on");
		$(this).addClass("on");
		$(".tab-content-wrap").removeClass("on");
		$(".tab-content-wrap").eq(i).addClass("on");
	});

	var i, items = $('.nav-link'), pane = $('.tab-pane');

  // next
  $('.nexttab').on('click',function(){

      for(i = 0; i < items.length; i++){

          if($(items[i]).hasClass('active') ==true){

              break;

          }

      }

      if(i < items.length - 1){

          // for tab

          $(items[i]).removeClass('active');

          $(items[i+1]).addClass('active');

          // for pane

          $(pane[i]).removeClass('show active');

          $(pane[i+1]).addClass('show active');

      }

 

  });

  // Prev

  $('.prevtab').on('click',function(){

      for(i = 0; i < items.length; i++){

          if($(items[i]).hasClass('active') ==true){

              break;

          }

      }

      if(i != 0){

          // for tab

          $(items[i]).removeClass('active');

          $(items[i-1]).addClass('active');

          // for pane

          $(pane[i]).removeClass('show active');

          $(pane[i-1]).addClass('show active');

      }

  });

	$(document).on("click",".btn_paging",function(){
		urls = "./ajax_certi_list.php?page="+ $(this).attr("data-idx")+"&cate="+$("input[name='cate']").val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_certi").html(html);

					$('.zoom-gallery').magnificPopup({
						delegate: 'a',
						type: 'image',
						closeOnContentClick: true,
						closeBtnInside: false,
						mainClass: 'mfp-with-zoom mfp-img-mobile',
						image: {
							verticalFit: true,
							titleSrc: function(item) {
								return item.el.attr('title') + ' &middot; <a class="image-source-link" href="'+item.el.attr('data-source')+'" target="_blank">image source</a>';
							}
						},
						gallery: {
							enabled: true
						},
						zoom: {
							enabled: true,
							duration: 300, // don't foget to change the duration also in CSS
							opener: function(element) {
								return element.find('img');
							}
						}			
					});
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	$(".webzinec a").on("click",function(){
		var i = $(this).parent("li").index();
		var cate = $(this).attr("data-cate");
		$(".webzinec li a").removeClass("on");
		$(this).addClass("on");
		$("input[name='cate']").val(cate);
		urls = "./ajax_webzine_list.php?page=1&cate="+cate+"&midx="+$("input[name='midx']").val() ;
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_content").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});	
	});

	$("#category").on("change",function(){
		var i = $(this).parent("li").index();
		var cate = $(this).val();
		$(".webzinec li a").removeClass("on");
		$(this).addClass("on");
		$("input[name='cate']").val(cate);
		urls = "./ajax_webzine_list.php?page=1&cate="+cate+"&midx="+$("input[name='midx']").val() ;
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_content").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});	
	});

	$(document).on("click",".btn_webzine_paging",function(){
		urls = "./ajax_webzine_list.php?page="+ $(this).attr("data-idx")+"&cate="+$("input[name='cate']").val()+"&midx="+$("input[name='midx']").val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_content").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	$(".faqc a").on("click",function(){
		var i = $(this).parent("li").index();
		var cate = $(this).attr("data-cate");
		$(".faqc li a").removeClass("on");
		$(this).addClass("on");
		$("input[name='cate']").val(cate);
		urls = "./ajax_faq_list.php?page=1&cate="+cate+ "&s_keyword="+$("input[name='s_keyword']").val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_content").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});	
	});

	$(document).on("click",".btn_faq_paging",function(){
		urls = "./ajax_faq_list.php?page="+ $(this).attr("data-idx")+"&cate="+$("input[name='cate']").val()+ "&s_keyword="+$("input[name='s_keyword']").val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_content").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	$(document).on("click",".btn_board_paging",function(){
		urls = "./ajax_"+$(this).attr("data-kind")+"_list.php?page="+ $(this).attr("data-idx") + "&s_keyword="+$("input[name='s_keyword']").val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_conetnt").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	$(document).on("change","#webzinem",function(){
		urls = "./ajax_webzinem.php?year="+ $(this).val();
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_conetnt").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	$(document).on("click",".btn_webzinem",function(){
		$(".area_year").text($(this).attr("data-year"));
		$(".btn_webzinem").parents("ul").hide();
		urls = "./ajax_webzinem.php?year="+$(this).attr("data-year");
		$.ajax({
			url:urls ,
			cache: false,
			context: document.body,
			beforeSend : function() {  },
			statusCode : {   404 : function () {  alert('레이아웃 로딩 실패');  }  },
			success    : function(html) {
				if(html){
					$("#set_conetnt").html(html);
				}
			},
			error      : function() { alert('통신오류발생');  },
			complete   : function() {
			}
		});
	});

	/* 오시는 길 맵 기능*/	
	$(".map-content-wrap").eq(1).hide();
	$(".map-content-wrap").eq(1).children(".map").hide();
	$(".map-content-wrap").eq(2).hide();	
	$(".map-tab li a").on("click",function(){
		var i = $(this).parent("li").index();
		if(i == 2){
			alert("준비 중입니다.");
		}else{
			$(".map-tab li a").removeClass("on");
			$(this).addClass("on");
			$(".map-content-wrap").hide();
			$(".map-content-wrap").eq(i).show();
			map.relayout();
			map2.relayout();
			map3.relayout();			
			map4.relayout();
			map5.relayout();
			map6.relayout();
			map7.relayout();
			map8.relayout();			
		}		
	});

	/* 오시는 길 지방 맵 기능 */
	$(".company05-content01 .location .province .marker").on("click",function(){
		var i = $(this).index();
		$(".company05-content01 .location .province .marker").removeClass("blinking");
		$(this).addClass("blinking");
		$(".map-slide").slick("slickGoTo",i-1);
	});

	$(document).on("click",".company05-content01 .map-slide a",function(){
		var i = $(this).parents(".slick-slide").attr("data-slick-index");		
		$(".map-content-wrap").eq(1).children(".map").hide();
		$(".map-content-wrap").eq(1).children(".map").eq(i).show();		
		$('html,body').animate({scrollTop:$("#show-maplist" + i).offset().top}, 500);
		map2.relayout();
		map4.relayout();
		map5.relayout();
		map6.relayout();
		map7.relayout();
		map8.relayout();
	});

	/* masonry function */
  $('.grid').masonry({
    // options
    itemSelector: '.grid-item',
    horizontalOrder: true,
    columnWidth: '.grid-sizer',
    gutter: 15    
  });

  /* 역사관 이미지 슬라이드 */
	$('.lightgallery').lightGallery({
	    thumbnail:true
	});

	/* 역사관 줌 버튼 */
	$(".slide-type01 .zoom").on("click",function(){
  	var copy = $(this).siblings().clone();

  	$("body").css({"overflow":"hidden"});
  	$(".popup-modal .wrap").append(copy);
  	$(".popup-modal,.modal-overlay").fadeIn();
  });
  
  /* 네이버 TV 멈춤 기능 */    
  $('iframe[src*="https://tv.naver.com/embed/"]').addClass("naver-iframe");
  $('.slide-type01 .arrow,.slidelist .zoom,.board-slide .zoom').click(function(){
      $('.naver-iframe').each(function(index) {
          $(this).attr('src', $(this).attr('src'));
      }); 
  });

  /* video tag 멈춤 기능 */
  $(".company02-content02 .slide-type01 .arrow,.board-slide .zoom").on("click",function(){
	  if($(".company02-content02 video").length > 0) {
	  	$(".company02-content02 video").get(0).pause();
	  }
  });

  /* 역사관 모달 닫기 버튼*/
  $(".popup-modal a").on("click",function(){
  	$("body").css({"overflow":"auto"});
  	$(".popup-modal,.modal-overlay").fadeOut();  	
  	setTimeout(function(){
  		$(".popup-modal .wrap *").remove();
  	},500);
  });
  
	/* 인증서 팝업 */	
	$('.zoom-gallery').magnificPopup({
		delegate: 'a',
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		mainClass: 'mfp-with-zoom mfp-img-mobile',
		image: {
			verticalFit: true,
			titleSrc: function(item) {
				return item.el.attr('title') + ' &middot; <a class="image-source-link" href="'+item.el.attr('data-source')+'" target="_blank">image source</a>';
			}
		},
		gallery: {
			enabled: true
		},
		zoom: {
			enabled: true,
			duration: 300, // don't foget to change the duration also in CSS
			opener: function(element) {
				return element.find('img');
			}
		}			
	});

	/* 게시판 단일 슬라이드 일 경우 버튼 히든*/	
	$(".board-slide").on("init",function(){
		var i = $(".board-slide .slick-slide .item").length;
		if(i == 1){
			$(".arrow").hide();
		}
	});
	

	/* 패밀리 사이트 이동 */
  $('footer select').on('change', function () {
      var url = $(this).val(); // get selected value
      window.open(url);      
  });
	
	/* 스크롤 탑 기능 */
	$(".top-btn a").on("click",function(){
		var body = $("html, body");
		body.stop().animate({scrollTop:0}, 500, 'swing');
	});

	var y1 = $("footer").offset().top;
	$(window).scroll(function(){				
		var y2 = $(".top-btn a").offset().top;

		if(y1 > y2){
			$(".top-btn a").removeClass("on");	
		}else{
			$(".top-btn a").addClass("on");
		}
		
	});

	/* 웹진 달력 선택 기능*/
	$(".webzine .year > a").on("click",function(){
		$(this).siblings("ul").fadeToggle();
	});

	/* 채용사이트 바로가기 선택 기능 */	
	$(".cs06-content04 .recruit-btn").on("click",function(){
		$(this).siblings("ul").fadeToggle();
		$(this).toggleClass("on");
		if($(this).parents(".clearfix").siblings("ul").find(".recruit-btn").hasClass("on")){
			$(this).parents(".clearfix").siblings("ul").find("ul").slideUp();
			$(this).parents(".clearfix").siblings("ul").find(".recruit-btn").removeClass("on");
		}
	});

	/* 푸터 패밀리사이트 선택 기능*/
	$("footer .select > a").on("click",function(){
		$(this).siblings("ul").fadeToggle();
		$(this).toggleClass("on");
	});

	/* 이메일주소 무단수집 거부 모달 기능*/
	$(".email-trigger").on("click",function(){
		$(".email-modal").fadeIn();
	});

	$(".email-modal .board-btn").on("click",function(){
		$(".email-modal").fadeOut();
	});
	
});