const ATTR_DISPLAY = 'sidebar-display';
const $sidebar = document.getElementById('sidebar');
const $trigger = document.getElementById('sidebar-trigger');
const $mask = document.getElementById('mask');

class SidebarUtil {
  static #isExpanded = true; // 기본값을 true로 설정

  static toggle() {
    this.#isExpanded = !this.#isExpanded;
    document.body.toggleAttribute(ATTR_DISPLAY, this.#isExpanded);
    $sidebar.classList.toggle('z-2', this.#isExpanded);
    $mask.classList.toggle('d-none', !this.#isExpanded);
  }
}

export function initSidebar() {
  // 초기 상태: 열려있음
  document.body.setAttribute(ATTR_DISPLAY, true);
  $sidebar.classList.add('z-2');
  $mask.classList.add('d-none');
  
  $trigger.onclick = $mask.onclick = () => SidebarUtil.toggle();
}
