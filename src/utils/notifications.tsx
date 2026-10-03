// src/utils/notifications.ts

import * as Notifications from "expo-notifications";
import { Contrato } from "../types";

// 1. Solicita permissões
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert(
      "A permissão para notificações é necessária para receber alertas de vencimento!"
    );
    return false;
  }
  return true;
}

// 2. Agenda uma notificação para um contrato
export async function scheduleContractAlert(
  contrato: Contrato,
  diasAntes: number
) {

  const dataAlerta = new Date(contrato.dataVencimento);
  dataAlerta.setDate(dataAlerta.getDate() - diasAntes);

  // Verifica se a data do alerta já passou
  if (dataAlerta.getTime() < Date.now()) {
    console.log(`Alerta para ${contrato.id} já deveria ter sido enviado.`);
    return;
  }

  // Agendar notificacao na data especifica
  const schedulingResult = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚨 Vencimento de Contrato Próximo!",
      body: `O contrato de ${contrato.clienteNome} (${
        contrato.banco
      }) no valor de R$${contrato.valor.toFixed(
        2
      )} vence em ${diasAntes} dia(s).`,
      data: { contratoId: contrato.id },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dataAlerta, // agendamento para data específica
    },
  });

  console.log(
    `Alerta agendado para o contrato ${contrato.id} em ${diasAntes} dias antes. id=${schedulingResult}`
  );
}

// 3. Exemplo de uso para um conjunto de contratos (chamado no carregamento da app)
export async function scheduleAllContractAlerts(contratos: Contrato[]) {
  const isPermitted = await requestNotificationPermissions();
  if (!isPermitted) return;

  const diasParaAlertar = [30, 15, 7, 2];

  // Para garantir que alertas antigos sejam removidos antes de reagendar
  await Notifications.cancelAllScheduledNotificationsAsync();

  contratos.forEach((contrato) => {
    diasParaAlertar.forEach((dias) => {
      scheduleContractAlert(contrato, dias);
    });
  });
}
