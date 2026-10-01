// this component is going to pop up and then hide after
// three seconds (we'll control this else where)


export default function Toast({notification, hide}) {


  return <div className="toast toast-top toast-end z-50 mt-15">
    <div className="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div className="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
}