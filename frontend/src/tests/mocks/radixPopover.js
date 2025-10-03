const React = require('react');

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const Root = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === 'boolean';
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  return React.createElement(
    PopoverContext.Provider,
    { value: { open: currentOpen, setOpen } },
    React.createElement('div', null, children),
  );
};

const Trigger = React.forwardRef(function Trigger(
  { children, onClick, ...props },
  ref,
) {
  const context = React.useContext(PopoverContext);
  return React.createElement(
    'button',
    {
      type: 'button',
      ref,
      ...props,
      onClick: (event) => {
        if (onClick) onClick(event);
        if (context) {
          context.setOpen(!context.open);
        }
      },
    },
    children,
  );
});

const Content = React.forwardRef(function Content(
  { children, style, ...props },
  ref,
) {
  const context = React.useContext(PopoverContext);
  if (!context || !context.open) {
    return null;
  }
  return React.createElement(
    'div',
    { ref, style: { pointerEvents: 'auto', ...style }, ...props },
    children,
  );
});

const Portal = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const Arrow = () => null;

module.exports = {
  __esModule: true,
  Root,
  Trigger,
  Content,
  Portal,
  Arrow,
};
