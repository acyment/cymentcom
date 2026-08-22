(function () {
  function fillBlank(field, value) {
    if (!field || field.value || !value) return;
    field.value = value;
  }

  function billingDataUrl(template, clienteId) {
    return template.replace('/0/', '/' + clienteId + '/');
  }

  function applyBillingData(data) {
    fillBlank(document.getElementById('id_nombre'), data.nombre);
    fillBlank(document.getElementById('id_email'), data.email);
    fillBlank(
      document.getElementById('id_tipo_identificacion_fiscal'),
      data.tipo_identificacion_fiscal,
    );
    fillBlank(
      document.getElementById('id_identificacion_fiscal'),
      data.identificacion_fiscal,
    );
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
