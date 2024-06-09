import { initializeEditor } from "@ligature/ligature-components/src/editor/ligature-editor"
import { useContext } from "solid-js";
import { StoreContext } from "./StoreProvider";

export function Editor() {
  let editor = null;
  const store = useContext(StoreContext);

  if (editor == null) {
    setTimeout(() => {
        const element = document.querySelector("#editor")
        editor = initializeEditor({
          element,
          onRun: async (script) => {
            //do nothing
          },
          onChange: (script) => {
            store.setEditorContent(script)
          }
        })
      }
    );
  }

  return <>
      <div id="editorWrapper">
        <div id="editor"></div>
      </div>
  </>;
}
