
    (function () {
      const doc = document.getElementById('doc');
      const docId = 'example-doc'; // Unique document ID

      // Configure Pusher
      const pusher = new Pusher('<INSERT_PUSHER_APP_KEY>', {
        cluster: '<INSERT_PUSHER_CLUSTER>',
      });

      const channel = pusher.subscribe(`document-${docId}`);

      // Listen for updates
      channel.bind('content-update', (data) => {
        const currentCursorPosition = getCaretCharacterOffsetWithin(doc);
        doc.innerHTML = data.content;
        setCaretPosition(doc, currentCursorPosition);
      });

      // Handle input and send updates to the server
      doc.addEventListener('input', () => {
        fetch('http://localhost:5000/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId, content: doc.innerHTML }),
        }).catch((err) => console.error('Error updating content:', err));
      });

      // Helper to get caret position
      function getCaretCharacterOffsetWithin(element) {
        let caretOffset = 0;
        const win = window.getSelection();
        if (win.rangeCount > 0) {
          const range = win.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
      }

      // Helper to set caret position
      function setCaretPosition(el, pos) {
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.length >= pos) {
              const range = document.createRange();
              const sel = window.getSelection();
              range.setStart(node, pos);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
              return -1;
            } else {
              pos -= node.length;
            }
          } else {
            pos = setCaretPosition(node, pos);
            if (pos === -1) return -1;
          }
        }
        return pos;
      }
    })();
  
