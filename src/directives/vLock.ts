export const vLock = {
    mounted(el: { classList: { add: (arg0: string) => void; remove: (arg0: string) => void; }; }, binding: { value: any; }) {
        if (binding.value) {
            el.classList.add('vlock')
        } else {
            el.classList.remove('vlock')
        }
      },
      updated(el: { _magicSpinnerWrapper: { style: { display: string; }; }; classList: { add: (arg0: string) => void; remove: (arg0: string) => void; }; }, binding: { value: any; }) {
        if (binding.value) {
            el.classList.add('vlock')
        } else {
            el.classList.remove('vlock')
        }
      },
  };
export default vLock