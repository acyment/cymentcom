import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';

const FAQ = () => {
  return (
    <Accordion.Root type="multiple" collapsible={true} className="FAQAccordion">
      <Accordion.Item value="PDUs" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Esta certificación otorga PDUs?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>

        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Este curso brinda 15 PDUs a quien ya es PMP. Además acredita 15 de las
          21 horas de entrenamiento en Agile Project Management para la
          certificación PMI-ACP. Para obtenerlos es necesario cargar la
          capacitación como "dictada por proveedor no registrado"
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="examen_certificacion" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Debo presentar un examen para certificarme?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Sí. Una vez finalizado el curso, tendrás todo lo que necesitas para
          tomar el examen CSM®, te llegará a tu mail un correo de la Scrum
          Alliance, en donde podrás ingresar para realizar el examen final y una
          vez que lo apruebes, serás un Scrum Master certificado/a.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="membresia_paga" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          Adicionalmente contarás con dos años de membresía paga.
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Después de obtener tu certificación Scrum Alliance, recibirás una
          insignia digital para validar tu nuevo logro. Las insignias digitales
          son íconos dinámicos y portátiles que están incrustados con
          información calificativa sobre tu credencial. Se pueden mostrar de
          forma cómoda y segura en tus sitios de redes sociales y profesionales,
          currículos, bolsas de trabajo, así como en tu firma de correo
          electrónico.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="costo_examen" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿El costo del entrenamiento incluye el derecho de examen de
          certificación ante la Scrum Alliance?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Si, incluye el derecho de examen para la certificación de Scrum
          Master. Posteriormente al entrenamiento y basado en los criterios de
          «Participación Exitosa», tu instructor (CST) realizará la inscripción
          ante Scrum Alliance. _Participar exitosamente_ del curso implica estar
          presente el 100% del tiempo y aportar valor a los demás participantes
          del curso.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="puntaje_minimo" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Cuál es el puntaje mínimo para aprobar el examen?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Se requieren 37 respuestas correctas sobre un total de 50.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="limite_tiempo" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Hay límite de tiempo para resolver el examen?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Si, el límite de tiempo para terminar el examen es de 60 minutos.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="no_aprueba" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Qué sucede si no apruebo el examen?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Tienes una oportunidad más de presentarlo de manera gratuita. Intentos
          posteriores tienen un costo de USD 25, los cuales deben ser cancelados
          directamente a Scrum Alliance.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="otorga_certificacion" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Quién otorga la certificación?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>
        <Accordion.Content className="AccordionContent RespuestaFAQ">
          La certificación es otorgada por la Scrum Alliance. Fundada en 2001,
          es la organización profesional con mayor trayectoria, establecida e
          influyente de la comunidad ágil a nivel internacional. Sus
          certificaciones, incluido el CSM, son las más reconocidas por las
          empresas de la industria a la hora de contratar profesionales con
          competencias de Scrum.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default FAQ;
