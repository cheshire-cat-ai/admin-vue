export const vLock = {
    mounted(el: { classList: { add: (arg0: string) => void; remove: (arg0: string) => void; }; }, binding: { value: any; }) {
      const { value } = binding
      if (value) {
        // Lock UI logic
        el.classList.add('v-lock')
      } else {
        // Unlock UI logic
        el.classList.remove('v-lock')
      }
    },
  };
export default vLock