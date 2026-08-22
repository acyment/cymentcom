(function () {
  function fillBlank(field, value) {
    if (!field || field.value || !value) return;
    field.value = value;
  }

  function billingDataUrl(template, clienteId) {
    return template.replace('/0/', '/' + clienteId + '/');
  }

  var CLIENTE_FIELDS = [
    'nombre',
    'email',
    'tipo_identificacion_fiscal',
    'identificacion_fiscal',
    'pais',
    'direccion',
    'cc_emails',
  ];

  function applyBillingData(data) {
    CLIENTE_FIELDS.forEach(function (field) {
      fillBlank(document.getElementById('id_' + field), data[field]);
    });
  }

  function onClienteChange(event) {
    var select = event.target;
    var clienteId = select.value;
    var template = select.getAttribute('data-billing-url-template');
    if (!clienteId || !template) return;

    fetch(billingDataUrl(template, clienteId))
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (data) {
        if (data) applyBillingData(data);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById('id_cliente');
    if (select) select.addEventListener('change', onClienteChange);
  });
})();
