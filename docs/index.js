console.clear();
$("html").addClass("pc");

function Page__init() {
  // 윈도우 객체
  const $window = $(window);
  const $html = $("html");

  if ($window.width() < 800) {
    $html.removeClass("pc");
    $html.addClass("mobile");
    return;
  }

  // 각 섹션들
  const Page__$section = $(".group > div:last-child > section");
  // 현재 섹션 번호
  let Page__index = 0;
  // 현재 이동중인지
  let Page__nowWork = false;
  // 현재 그룹right 안에 있는지 여부
  let Page__inGroupRight = false;
  // 현재 그룹right에 진입하고 있는지 여부
  let Page__enteringGroupRight = false;
  // 현재 그룹right에서 나오고 있는지 여부
  let Page__leavingGroupRight = false;
  // 올라가고 있는지 여부
  let Page__isDirUp = false;
  // 전체 섹션 개수
  const Page__max = Page__$section.length;
  // 듀레이션
  const Page__duration = 200;

  // 위로가기
  function Page__prev() {
    const newIndex = Page__index == 0 ? 0 : Page__index - 1;
    Page__move(newIndex);
  }

  // 위로가기, 민감도 낮음
  const Page__prevDebounce = _.debounce(Page__prev, 300);

  // 내려가기
  function Page__next() {
    const newIndex =
      Page__index + 1 == Page__max ? Page__index : Page__index + 1;
    Page__move(newIndex);
  }

  // 내려가기, 민감도 낮음
  const Page__nextDebounce = _.debounce(Page__next, 300);

  // 페이지 이동
  function Page__move(index) {
    // 현재 작동중이라면 종료
    if (Page__nowWork) return;

    // 목적지가 현재 인덱스와 같다면 종료
    if (Page__index == index) return;

    // 이동중으로 표시
    Page__nowWork = true;

    // 올라가고 있는지 여부 체크
    if (index > Page__index) {
      Page__isDirUp = false;
    } else {
      Page__isDirUp = true;
    }

    // 이전 index
    const lastIndex = Page__index;

    // 새로운 index
    Page__index = index;
    
    Page__$section.siblings('.active').removeClass('active');
    Page__$section.eq(index).addClass('active');

    // 해당 섹션으로 이동
    const top = Page__$section.eq(index).offset().top;
    $html.stop().animate({ scrollTop: top }, Page__duration);

    // 그룹내 인덱스
    const inGroupIndex = Page__$section.eq(index).index();

    // 현재 내가 그룹right에 있는지
    const inGroupRight = Page__$section.eq(index)
      .parent()
      .parent()
      .hasClass("group-right");

    if (inGroupRight) {
      // 래퍼
      const $div = Page__$section.eq(index).parent().prev();

      if (Page__inGroupRight) {
        Page__enteringGroupRight = false;
      } else {
        Page__enteringGroupRight = true;
      }

      Page__inGroupRight = true;

      const duration = Page__duration;
      const slideDuration = Page__enteringGroupRight ? 0 : duration;

      // 진입중
      if (Page__enteringGroupRight) {
        const fixedDelay = duration;

        if (Page__isDirUp) {
          // 밑바닥에서 마중나간다.
          $div.css("top", "auto").css("bottom", "0");
        } else {
          // 맨위에서 마중나간다.
          $div.css("top", "0").css("bottom", "auto");
        }

        // 진입중일 때, 바로 fixed를 걸면, 기존 섹션에서 따나는 장면으 뭍힌다.
        setTimeout(function () {
          Page__$section.eq(index).parent().parent().addClass("fixed");
        }, fixedDelay);
      }

      // 슬라이드 이동
      $div.stop().animate(
        {
          left: inGroupIndex * -100 + "%"
        },
        slideDuration
      );
    } else {
      if (Page__inGroupRight) {
        Page__leavingGroupRight = true;
      }

      Page__inGroupRight = false;

      if (Page__leavingGroupRight) {
        // 이전 섹션의 래퍼
        const $div = Page__$section.eq(lastIndex).parent().prev();

        if (Page__isDirUp) {
          $div.css("top", "0").css("bottom", "auto");
        } else {
          $div.css("bottom", "0").css("top", "auto");
        }

        $(".group.fixed").removeClass("fixed");
      }
    }

    // 작업중 해제
    setTimeout(function () {
      Page__nowWork = false;
    }, Page__duration);
  }

  // 휠에 따른 위/아래
  window.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();

      if (event.deltaY < 0) {
        Page__prevDebounce();
      } else {
        Page__nextDebounce();
      }
    },
    { passive: false }
  );

  // 위,아래,페이지업,페이지다운, 홈, 엔드
  $(window).on("keydown", function (event) {
    if (event.keyCode == 38 || event.keyCode == 36 || event.keyCode == 33) {
      Page__prevDebounce();
      event.preventDefault();
    } else if (
      event.keyCode == 40 ||
      event.keyCode == 35 ||
      event.keyCode == 34
    ) {
      Page__nextDebounce();
      event.preventDefault();
    }
  });

  function setScreenSize() {
    const vh = window.innerHeight;

    document.documentElement.style.setProperty("--full-vh", `${vh}px`);
  }

  setScreenSize();

  // 화면이 변경되었다면, 현재페이지로 다시이동
  $window.resize(
    _.debounce(function () {
      setScreenSize();

      setTimeout(function () {
        setScreenSize();
        const top = Page__$section.eq(Page__index).offset().top;
        $window.scrollTop(top);
      }, 100);
    }, 100)
  );

  let touchEvent = null;

  document.addEventListener("touchstart", function (e) {
    touchEvent = e;
  });

  document.addEventListener(
    "touchmove",
    function (e) {
      if (event) {
        const delta = e.touches[0].pageY - touchEvent.touches[0].pageY;

        const throttlePoint = 40;

        if (delta > throttlePoint) {
          Page__prevDebounce();
        } else if (delta < throttlePoint * -1) {
          Page__nextDebounce();
        }
      }

      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener("touchend", function (e) {
    touchEvent = null;
  });
  
  setTimeout(function() {
    $(window).scrollTop(0);
    Page__move(0);
  }, 1500);

  return {
    Page__move
  };
}

const { Page__move } = Page__init();

gsap.registerPlugin(ScrollTrigger);
$(".group-right.dark").each(function (index, node) {
  ScrollTrigger.create({
    trigger: node,
    //markers: true,
    start: "top top+=50",
    end: "bottom top",
    scrub: true,
    onEnter: () => $(".header").addClass("dark"),
    onLeave: () => $(".header").removeClass("dark"),
    onEnterBack: () => $(".header").addClass("dark"),
    onLeaveBack: () => $(".header").removeClass("dark")
  });
});

$('body').imagesLoaded(function() {
  $('.loading').remove();
});